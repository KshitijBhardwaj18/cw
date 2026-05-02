import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { $Enums, type TaggingRule, type TaggingRuleQuestion } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateTaggingRuleDto } from "./dto/create-tagging-rule.dto";
import type { UpdateTaggingRuleDto } from "./dto/update-tagging-rule.dto";

const TAGGING_RULE_INCLUDE = {
	tagToApply: {
		select: {
			id: true,
			name: true,
			type: true,
			description: true,
			showOnSubmission: true,
		},
	},
	taggingRuleQuestions: {
		include: {
			question: {
				select: {
					id: true,
					questionText: true,
					questionnaire: {
						select: {
							id: true,
							occupationId: true,
							specialtyId: true,
							occupation: {
								select: {
									id: true,
									occupation: {
										select: { id: true, name: true, acronym: true },
									},
								},
							},
							specialty: {
								select: {
									id: true,
									specialty: {
										select: { id: true, name: true, acronym: true },
									},
								},
							},
						},
					},
				},
			},
		},
	},
} as const;

export type TaggingRuleWithDetails = TaggingRule & {
	tagToApply: {
		id: string;
		name: string;
		type: string;
		description: string | null;
		showOnSubmission: boolean;
	};
	taggingRuleQuestions: Array<
		TaggingRuleQuestion & {
			question: {
				id: string;
				questionText: string;
				questionnaire: {
					id: string;
					occupationId: string | null;
					specialtyId: string | null;
					occupation: {
						id: string;
						occupation: { id: string; name: string; acronym: string };
					} | null;
					specialty: {
						id: string;
						specialty: { id: string; name: string; acronym: string };
					} | null;
				};
			};
		}
	>;
};

@Injectable()
export class TaggingRulesService {
	constructor(private readonly prisma: PrismaService) {}

	private async ensureOrgExists(organizationId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException(`Organization ${organizationId} not found`);
		}
	}

	async findTaggingRulesByOrganization(
		organizationId: string,
	): Promise<{ data: TaggingRuleWithDetails[]; stats: TaggingRuleStats }> {
		await this.ensureOrgExists(organizationId);

		const [data, totalRules, activeRules, submissionVisible] =
			await Promise.all([
				this.prisma.taggingRule.findMany({
					where: { organizationId },
					include: TAGGING_RULE_INCLUDE,
					orderBy: { createdAt: "desc" },
				}),
				this.prisma.taggingRule.count({ where: { organizationId } }),
				this.prisma.taggingRule.count({
					where: { organizationId, active: true },
				}),
				this.prisma.taggingRule.count({
					where: { organizationId, showOnSubmission: true },
				}),
			]);

		return {
			data: data as TaggingRuleWithDetails[],
			stats: {
				totalRules,
				activeRules,
				submissionVisible,
			},
		};
	}

	async findOne(
		organizationId: string,
		taggingRuleId: string,
	): Promise<TaggingRuleWithDetails | null> {
		const rule = await this.prisma.taggingRule.findFirst({
			where: { id: taggingRuleId, organizationId },
			include: TAGGING_RULE_INCLUDE,
		});
		return rule as TaggingRuleWithDetails | null;
	}

	async getQuestionsForQuestionnaire(
		organizationId: string,
		questionSourceType: "OCCUPATION" | "SPECIALTY",
		organizationOccupationId?: string,
		organizationSpecialtyId?: string,
	) {
		await this.ensureOrgExists(organizationId);

		const questionnaireWhere: {
			organizationId: string;
			occupationId?: string;
			specialtyId?: string;
		} = { organizationId };

		if (questionSourceType === "OCCUPATION") {
			if (!organizationOccupationId) {
				return [];
			}
			questionnaireWhere.occupationId = organizationOccupationId;
		} else {
			if (!organizationSpecialtyId) {
				return [];
			}
			questionnaireWhere.specialtyId = organizationSpecialtyId;
		}

		const questionnaire = await this.prisma.questionnaire.findFirst({
			where: questionnaireWhere,
			include: {
				questions: {
					orderBy: { order: "asc" },
					select: {
						id: true,
						questionText: true,
						order: true,
					},
				},
			},
		});

		return questionnaire?.questions ?? [];
	}

	async create(
		organizationId: string,
		dto: CreateTaggingRuleDto,
		userId: string,
	): Promise<TaggingRuleWithDetails> {
		await this.ensureOrgExists(organizationId);

		const questionnaireId = await this.resolveQuestionnaireId(
			organizationId,
			dto,
		);
		await this.validateQuestionBelongsToQuestionnaire(
			dto.questionId,
			questionnaireId,
		);

		const tag = await this.prisma.tag.findUnique({
			where: { id: dto.tagId },
		});
		if (!tag) {
			throw new NotFoundException(`Tag ${dto.tagId} not found`);
		}

		const rule = await this.prisma.taggingRule.create({
			data: {
				organizationId,
				ruleName: dto.ruleName,
				category: dto.category,
				showOnSubmission: dto.showOnSubmission ?? false,
				tagId: dto.tagId,
				createdBy: userId,
				updatedBy: userId,
			},
			include: TAGGING_RULE_INCLUDE,
		});

		await this.prisma.taggingRuleQuestion.create({
			data: {
				taggingRuleId: rule.id,
				questionId: dto.questionId,
				condition: dto.condition as $Enums.ConditionType,
				triggerValue: dto.triggerValue,
				createdBy: userId,
				updatedBy: userId,
			},
		});

		return this.findOne(
			organizationId,
			rule.id,
		) as Promise<TaggingRuleWithDetails>;
	}

	async update(
		organizationId: string,
		taggingRuleId: string,
		dto: UpdateTaggingRuleDto,
		userId: string,
	): Promise<TaggingRuleWithDetails> {
		const existing = await this.findOne(organizationId, taggingRuleId);
		if (!existing) {
			throw new NotFoundException(`Tagging rule ${taggingRuleId} not found`);
		}

		const updateData: {
			ruleName?: string;
			category?: string;
			showOnSubmission?: boolean;
			tagId?: string;
			updatedBy: string;
		} = { updatedBy: userId };
		if (dto.ruleName !== undefined) updateData.ruleName = dto.ruleName;
		if (dto.category !== undefined) updateData.category = dto.category;
		if (dto.showOnSubmission !== undefined)
			updateData.showOnSubmission = dto.showOnSubmission;
		if (dto.tagId !== undefined) updateData.tagId = dto.tagId;
		updateData.updatedBy = userId;

		await this.prisma.taggingRule.update({
			where: { id: taggingRuleId },
			data: updateData,
		});

		const triggerQuestion = existing.taggingRuleQuestions[0];
		if (
			triggerQuestion &&
			(dto.questionId !== undefined ||
				dto.condition !== undefined ||
				dto.triggerValue !== undefined)
		) {
			await this.prisma.taggingRuleQuestion.update({
				where: { id: triggerQuestion.id },
				data: {
					...(dto.questionId !== undefined && { questionId: dto.questionId }),
					...(dto.condition !== undefined && {
						condition: dto.condition as $Enums.ConditionType,
					}),
					...(dto.triggerValue !== undefined && {
						triggerValue: dto.triggerValue,
					}),
					updatedBy: userId,
				},
			});
		}

		return this.findOne(
			organizationId,
			taggingRuleId,
		) as Promise<TaggingRuleWithDetails>;
	}

	async delete(organizationId: string, taggingRuleId: string): Promise<void> {
		const existing = await this.findOne(organizationId, taggingRuleId);
		if (!existing) {
			throw new NotFoundException(`Tagging rule ${taggingRuleId} not found`);
		}
		await this.prisma.taggingRule.delete({
			where: { id: taggingRuleId },
		});
	}

	async getTagsForOrg(_organizationId: string) {
		await this.ensureOrgExists(_organizationId);
		return this.prisma.tag.findMany({
			orderBy: [{ type: "asc" }, { name: "asc" }],
			select: {
				id: true,
				name: true,
				type: true,
				description: true,
				showOnSubmission: true,
			},
		});
	}

	async getTagsWithRuleCounts(organizationId: string) {
		await this.ensureOrgExists(organizationId);
		const tags = await this.prisma.tag.findMany({
			orderBy: [{ type: "asc" }, { name: "asc" }],
			include: {
				_count: {
					select: {
						taggingRules: true,
					},
				},
				taggingRules: {
					where: { organizationId },
					select: {
						id: true,
						active: true,
						ruleName: true,
					},
				},
			},
		});

		return tags.map((tag) => {
			const orgRules = tag.taggingRules;
			const activeCount = orgRules.filter((r) => r.active).length;
			return {
				id: tag.id,
				name: tag.name,
				type: tag.type,
				description: tag.description,
				showOnSubmission: tag.showOnSubmission,
				activeRules: activeCount,
				totalRules: orgRules.length,
				rules: orgRules,
			};
		});
	}

	private async resolveQuestionnaireId(
		organizationId: string,
		dto: CreateTaggingRuleDto,
	): Promise<string> {
		if (dto.questionSourceType === "OCCUPATION") {
			if (!dto.organizationOccupationId) {
				throw new BadRequestException(
					"Organization occupation is required when source type is OCCUPATION",
				);
			}
			const q = await this.prisma.questionnaire.findFirst({
				where: {
					organizationId,
					occupationId: dto.organizationOccupationId,
				},
				select: { id: true },
			});
			if (!q) {
				throw new NotFoundException(
					"No questionnaire found for this occupation",
				);
			}
			return q.id;
		}

		if (!dto.organizationSpecialtyId) {
			throw new BadRequestException(
				"Organization specialty is required when source type is SPECIALTY",
			);
		}
		const q = await this.prisma.questionnaire.findFirst({
			where: {
				organizationId,
				specialtyId: dto.organizationSpecialtyId,
			},
			select: { id: true },
		});
		if (!q) {
			throw new NotFoundException("No questionnaire found for this specialty");
		}
		return q.id;
	}

	private async validateQuestionBelongsToQuestionnaire(
		questionId: string,
		questionnaireId: string,
	): Promise<void> {
		const question = await this.prisma.question.findFirst({
			where: { id: questionId, questionnaireId },
		});
		if (!question) {
			throw new BadRequestException(
				"Question does not belong to the selected questionnaire",
			);
		}
	}
}

export interface TaggingRuleStats {
	totalRules: number;
	activeRules: number;
	submissionVisible: number;
}
