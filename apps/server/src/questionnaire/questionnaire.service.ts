import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { QuestionType } from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateQuestionDto } from "./dto/create-question.dto";
import type {
	QuestionnaireDetailDto,
	QuestionWithTaggingDto,
} from "./dto/questionnaire-detail.dto";
import type { UpdateQuestionDto } from "./dto/update-question.dto";

const OPTION_REQUIRING_TYPES: QuestionType[] = [
	QuestionType.CHECKBOX,
	QuestionType.SELECT,
	QuestionType.RADIO_BUTTON,
];

@Injectable()
export class QuestionnaireService {
	private readonly logger = new Logger(QuestionnaireService.name);

	constructor(private readonly prismaService: PrismaService) {}

	async getOrCreateQuestionnaire(
		organizationId: string,
		occupationId?: string,
		specialtyId?: string,
	): Promise<QuestionnaireDetailDto> {
		if (!!occupationId === !!specialtyId) {
			throw new BadRequestException(
				"Exactly one of occupationId or specialtyId must be provided",
			);
		}

		let questionnaire = await this.prismaService.questionnaire.findFirst({
			where: {
				organizationId,
				...(occupationId ? { occupationId } : { specialtyId }),
			},
			include: this.getQuestionnaireInclude(),
		});

		if (!questionnaire) {
			questionnaire = await this.prismaService.questionnaire.create({
				data: {
					organizationId,
					...(occupationId ? { occupationId } : { specialtyId }),
				},
				include: this.getQuestionnaireInclude(),
			});
		}

		return this.mapToDetail(questionnaire);
	}

	async getQuestionnaireDetail(
		id: string,
		organizationId: string,
	): Promise<QuestionnaireDetailDto> {
		const questionnaire = await this.prismaService.questionnaire.findFirst({
			where: { id, organizationId },
			include: this.getQuestionnaireInclude(),
		});

		if (!questionnaire) {
			throw new NotFoundException("Questionnaire not found");
		}

		return this.mapToDetail(questionnaire);
	}

	async createQuestion(
		questionnaireId: string,
		dto: CreateQuestionDto,
		userId: string,
	): Promise<QuestionWithTaggingDto> {
		await this.ensureQuestionnaireExists(questionnaireId);

		if (OPTION_REQUIRING_TYPES.includes(dto.type)) {
			if (!dto.options?.length) {
				throw new BadRequestException(
					"At least one option is required for Checkbox, Select, and Radio Button question types",
				);
			}
		}

		const options = dto.type === QuestionType.TEXT ? [] : (dto.options ?? []);

		const maxOrder = await this.prismaService.question.findFirst({
			where: {
				questionnaireId,
				includeInSubmission: true,
				order: { not: null },
			},
			orderBy: { order: "desc" },
			select: { order: true },
		});

		const question = await this.prismaService.question.create({
			data: {
				questionnaireId,
				questionText: dto.questionText,
				type: dto.type,
				options,
				required: dto.required ?? false,
				includeInSubmission: dto.includeInSubmission ?? false,
				order: dto.includeInSubmission ? (maxOrder?.order ?? 0) + 1 : null,
				createdBy: userId,
				updatedBy: userId,
			},
			include: this.getQuestionInclude(),
		});

		this.logger.log(
			`Created question ${question.id} on questionnaire ${questionnaireId}`,
		);
		return this.mapQuestion(question);
	}

	async updateQuestion(
		questionnaireId: string,
		questionId: string,
		dto: UpdateQuestionDto,
		userId: string,
	): Promise<QuestionWithTaggingDto> {
		const existing = await this.prismaService.question.findFirst({
			where: { id: questionId, questionnaireId },
			include: this.getQuestionInclude(),
		});

		if (!existing) {
			throw new NotFoundException("Question not found");
		}

		const type = dto.type ?? existing.type;
		if (OPTION_REQUIRING_TYPES.includes(type)) {
			const options = dto.options ?? existing.options;
			if (!options?.length) {
				throw new BadRequestException(
					"At least one option is required for Checkbox, Select, and Radio Button question types",
				);
			}
		}

		const options =
			type === QuestionType.TEXT ? [] : (dto.options ?? existing.options);

		let orderUpdate: { order: number | null } | undefined;
		if (dto.includeInSubmission !== undefined) {
			if (dto.includeInSubmission) {
				if (!existing.includeInSubmission || existing.order == null) {
					const maxOrder = await this.prismaService.question.findFirst({
						where: {
							questionnaireId,
							includeInSubmission: true,
							order: { not: null },
							id: { not: questionId },
						},
						orderBy: { order: "desc" },
						select: { order: true },
					});
					orderUpdate = { order: (maxOrder?.order ?? 0) + 1 };
				}
			} else {
				orderUpdate = { order: null };
			}
		}

		const question = await this.prismaService.question.update({
			where: { id: questionId },
			data: {
				...(dto.questionText !== undefined && {
					questionText: dto.questionText,
				}),
				...(dto.type !== undefined && { type: dto.type }),
				options,
				...(dto.required !== undefined && { required: dto.required }),
				...(dto.includeInSubmission !== undefined && {
					includeInSubmission: dto.includeInSubmission,
				}),
				...orderUpdate,
				updatedBy: userId,
			},
			include: this.getQuestionInclude(),
		});

		this.logger.log(
			`Updated question ${questionId} on questionnaire ${questionnaireId}`,
		);
		return this.mapQuestion(question);
	}

	async deleteQuestion(
		questionnaireId: string,
		questionId: string,
		organizationId: string,
	): Promise<void> {
		const question = await this.prismaService.question.findFirst({
			where: { id: questionId, questionnaireId },
		});

		if (!question) {
			throw new NotFoundException("Question not found");
		}

		await this.ensureQuestionnaireInOrg(questionnaireId, organizationId);

		if (question.includeInSubmission) {
			throw new BadRequestException(
				"Cannot delete a question included in Submission Readiness",
			);
		}

		await this.prismaService.question.delete({
			where: { id: questionId },
		});
		this.logger.log(
			`Deleted question ${questionId} from questionnaire ${questionnaireId}`,
		);
	}

	async reorderSubmissionReadiness(
		questionnaireId: string,
		questionIds: string[],
		organizationId: string,
	): Promise<void> {
		await this.ensureQuestionnaireInOrg(questionnaireId, organizationId);

		const questions = await this.prismaService.question.findMany({
			where: {
				id: { in: questionIds },
				questionnaireId,
				includeInSubmission: true,
			},
		});

		if (questions.length !== questionIds.length) {
			throw new BadRequestException(
				"All question IDs must belong to this questionnaire and have includeInSubmission set",
			);
		}

		await this.prismaService.$transaction(
			questionIds.map((id, index) =>
				this.prismaService.question.update({
					where: { id },
					data: { order: index + 1 },
				}),
			),
		);
		this.logger.log(
			`Reordered submission readiness for questionnaire ${questionnaireId}`,
		);
	}

	async toggleActive(
		questionnaireId: string,
		active: boolean,
		organizationId: string,
	): Promise<void> {
		await this.ensureQuestionnaireInOrg(questionnaireId, organizationId);

		await this.prismaService.questionnaire.update({
			where: { id: questionnaireId },
			data: { active },
		});
		this.logger.log(
			`Toggled questionnaire ${questionnaireId} active=${active}`,
		);
	}

	private getQuestionnaireInclude() {
		return {
			occupation: {
				include: {
					occupation: { select: { name: true } },
				},
			},
			specialty: {
				include: {
					specialty: { select: { name: true } },
				},
			},
			questions: {
				include: this.getQuestionInclude(),
				orderBy: [
					{ order: "asc" },
					{ createdAt: "asc" },
				] as Prisma.QuestionOrderByWithRelationInput[],
			},
		} as const;
	}

	private getQuestionInclude() {
		return {
			taggingRuleQuestions: {
				include: {
					taggingRule: {
						include: {
							tagToApply: { select: { id: true, name: true } },
						},
					},
				},
			},
		} as const;
	}

	private async ensureQuestionnaireExists(
		questionnaireId: string,
	): Promise<void> {
		const exists = await this.prismaService.questionnaire.findUnique({
			where: { id: questionnaireId },
		});
		if (!exists) {
			throw new NotFoundException("Questionnaire not found");
		}
	}

	private async ensureQuestionnaireInOrg(
		questionnaireId: string,
		organizationId: string,
	): Promise<void> {
		const q = await this.prismaService.questionnaire.findFirst({
			where: { id: questionnaireId, organizationId },
		});
		if (!q) {
			throw new NotFoundException("Questionnaire not found");
		}
	}

	private mapToDetail(
		q: Awaited<ReturnType<PrismaService["questionnaire"]["findFirst"]>> & {
			occupation?: {
				occupation: { name: string };
			} | null;
			specialty?: {
				specialty: { name: string };
			} | null;
			questions: Array<
				Awaited<ReturnType<PrismaService["question"]["findFirst"]>> & {
					taggingRuleQuestions: Array<{
						id: string;
						condition: string;
						triggerValue: string;
						taggingRule: {
							id: string;
							ruleName: string;
							tagToApply: { id: string; name: string };
						};
					}>;
				}
			>;
		},
	): QuestionnaireDetailDto {
		return {
			id: q.id,
			active: q.active,
			organizationId: q.organizationId,
			occupationId: q.occupationId,
			specialtyId: q.specialtyId,
			occupationName: q.occupation?.occupation?.name,
			specialtyName: q.specialty?.specialty?.name,
			questions: q.questions.map((qu) => this.mapQuestion(qu)),
		};
	}

	private mapQuestion(qu: {
		id: string;
		order: number | null;
		questionText: string;
		type: QuestionType;
		options: string[];
		required: boolean;
		includeInSubmission: boolean;
		taggingRuleQuestions: Array<{
			id: string;
			condition: string;
			triggerValue: string;
			taggingRule: {
				id: string;
				ruleName: string;
				tagToApply: { id: string; name: string };
			};
		}>;
	}): QuestionWithTaggingDto {
		return {
			id: qu.id,
			order: qu.order,
			questionText: qu.questionText,
			type: qu.type,
			options: qu.options,
			required: qu.required,
			includeInSubmission: qu.includeInSubmission,
			taggingRuleCount: qu.taggingRuleQuestions.length,
			taggingRuleQuestions: qu.taggingRuleQuestions.map((trq) => ({
				id: trq.id,
				condition: trq.condition,
				triggerValue: trq.triggerValue,
				taggingRule: {
					id: trq.taggingRule.id,
					ruleName: trq.taggingRule.ruleName,
					tagToApply: trq.taggingRule.tagToApply,
				},
			})),
		};
	}
}
