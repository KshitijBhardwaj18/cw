import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { CandidateExperienceBand, CandidateInviteStatus } from "@repo/db";
import {
	S3_PREFIX_CANDIDATE_RESUMES,
	S3_PREFIX_CANDIDATE_SKILLS_CHECKLISTS,
	SKILLS_CHECKLIST_ALLOWED_MIMES,
	SKILLS_CHECKLIST_MAX_SIZE_BYTES,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { FilesService } from "src/files/files.service";
import { OccupationsService } from "src/occupations/services/occupations.service";
import { PrismaService } from "src/prisma/prisma.service";
import { MAX_RESUME_SIZE_BYTES } from "../constants";
import { type CompleteMeInviteDto } from "../dto/complete-me-invite.dto";
import { type OnboardingProgressMePatchDto } from "../dto/onboarding-progress-me-patch.dto";
import { type OnboardingProgressMeResponseDto } from "../dto/onboarding-progress-me-response.dto";
import {
	type OnboardingQuestionnaireScopeDto,
	type OnboardingQuestionnairesResponseDto,
} from "../dto/onboarding-questionnaires-response.dto";
import { type SaveOnboardingIdentityDto } from "../dto/save-onboarding-identity.dto";
import { type SaveOnboardingQuestionnaireAnswersDto } from "../dto/save-onboarding-questionnaire-answers.dto";
import { type SaveOnboardingReferencesDto } from "../dto/save-onboarding-references.dto";

function toIsoDate(value: Date | null): string | null {
	if (!value) return null;
	return value.toISOString().slice(0, 10);
}

@Injectable()
export class CandidatesOnboardingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
		private readonly backgroundJobs: BackgroundJobsService,
		private readonly occupationsService: OccupationsService,
	) {}

	async getOrgEnabledOccupationsForMe(userId: string) {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { organizationId: true },
		});
		if (!candidate?.organizationId) {
			throw new BadRequestException("Candidate profile not found.");
		}
		return this.occupationsService.getLinkedOccupationsForOrganization(
			candidate.organizationId,
			{ all: true },
		);
	}

	async getOrgEnabledSpecialtiesForMeOccupation(
		userId: string,
		occupationId: string,
	) {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { organizationId: true },
		});
		if (!candidate?.organizationId) {
			throw new BadRequestException("Candidate profile not found.");
		}
		return this.occupationsService.getOrgEnabledSpecialtiesForOccupation({
			organizationId: candidate.organizationId,
			occupationId,
		});
	}

	async getMeOnboarding(
		userId: string,
	): Promise<OnboardingProgressMeResponseDto> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			include: {
				user: { select: { name: true, email: true, phoneNumber: true } },
				organization: { select: { id: true, name: true } },
				occupation: { select: { id: true, name: true } },
				candidateSpecialties: {
					select: {
						specialtyId: true,
						specialty: { select: { id: true, name: true } },
					},
				},
				candidatePreferredLocations: {
					select: {
						locationId: true,
						location: {
							select: { id: true, name: true, city: true, state: true },
						},
					},
				},
				professionalReferences: {
					orderBy: [{ position: "asc" }, { createdAt: "asc" }],
				},
			},
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		const isProfileIncomplete =
			!candidate.occupationId ||
			candidate.candidateSpecialties.length === 0 ||
			candidate.candidatePreferredLocations.length === 0 ||
			candidate.preferredShiftTypes.length === 0 ||
			!candidate.resumeUrl;

		return {
			name: candidate.user.name,
			email: candidate.user.email,
			organizationId: candidate.organizationId ?? "",
			organizationName: candidate.organization?.name ?? "",
			occupationId: candidate.occupationId ?? "",
			occupationName: candidate.occupation?.name ?? "",
			phoneNumber: candidate.user.phoneNumber ?? "",
			streetAddress: candidate.streetAddress ?? "",
			city: candidate.city ?? "",
			state: candidate.state ?? "",
			zipCode: candidate.zipCode ?? "",
			specialtyIds: candidate.candidateSpecialties.map((s) => s.specialtyId),
			locationIds: candidate.candidatePreferredLocations.map(
				(l) => l.locationId,
			),
			specialties: candidate.candidateSpecialties.map((s) => ({
				id: s.specialty.id,
				name: s.specialty.name,
			})),
			locations: candidate.candidatePreferredLocations.map((l) => ({
				id: l.location.id,
				name: l.location.name,
				city: l.location.city,
				state: l.location.state,
			})),
			preferredShiftTypes: candidate.preferredShiftTypes,
			willingToRelocate: candidate.willingToRelocate,
			resumeUrl: candidate.resumeUrl ?? null,
			showProfileBanner:
				isProfileIncomplete && !candidate.profileBannerDismissedAt,
			preferredContractLengths: candidate.preferredContractLengths ?? [],
			inviteStatus: candidate.inviteStatus,
			onboardingCompletedAt: candidate.onboardingCompletedAt,
			totalProfessionalExperienceBand:
				candidate.totalProfessionalExperienceBand ?? null,
			earliestStartDate: toIsoDate(candidate.earliestStartDate),
			recentJobTitle: candidate.recentJobTitle ?? null,
			dateOfBirth: toIsoDate(candidate.dateOfBirth),
			lastFourSsn: candidate.lastFourSsn ?? null,
			skillsChecklistFileKey: candidate.skillsChecklistFileKey ?? null,
			professionalReferences: candidate.professionalReferences.map((r) => ({
				id: r.id,
				fullName: r.fullName,
				title: r.title,
				organization: r.organization,
				relationship: r.relationship,
				phone: r.phone,
				email: r.email,
			})),
			workforceType: candidate.workforceType ?? null,
		};
	}

	async dismissProfileBanner(userId: string): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		await this.prisma.candidate.update({
			where: { id: candidate.id },
			data: { profileBannerDismissedAt: new Date() },
		});

		return { success: true };
	}

	async saveMeOnboarding(
		userId: string,
		dto: OnboardingProgressMePatchDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true, userId: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		await this.prisma.$transaction(async (tx) => {
			if (dto.name !== undefined || dto.phoneNumber !== undefined) {
				await tx.user.update({
					where: { id: candidate.userId },
					data: {
						...(dto.name !== undefined && { name: dto.name }),
						...(dto.phoneNumber !== undefined && {
							phoneNumber: dto.phoneNumber,
						}),
					},
				});
			}

			const candidateUpdate: Record<string, unknown> = {};
			if (dto.streetAddress !== undefined)
				candidateUpdate.streetAddress = dto.streetAddress;
			if (dto.city !== undefined) candidateUpdate.city = dto.city;
			if (dto.state !== undefined) candidateUpdate.state = dto.state;
			if (dto.zipCode !== undefined) candidateUpdate.zipCode = dto.zipCode;
			if (dto.occupationId !== undefined)
				candidateUpdate.occupationId = dto.occupationId;
			if (dto.preferredShiftTypes !== undefined)
				candidateUpdate.preferredShiftTypes = dto.preferredShiftTypes;
			if (dto.willingToRelocate !== undefined)
				candidateUpdate.willingToRelocate = dto.willingToRelocate;
			if (dto.preferredContractLengths !== undefined)
				candidateUpdate.preferredContractLengths = dto.preferredContractLengths;
			if (dto.totalProfessionalExperienceBand !== undefined) {
				candidateUpdate.totalProfessionalExperienceBand =
					dto.totalProfessionalExperienceBand;
			}
			if (dto.earliestStartDate !== undefined)
				candidateUpdate.earliestStartDate = new Date(dto.earliestStartDate);
			if (dto.recentJobTitle !== undefined)
				candidateUpdate.recentJobTitle = dto.recentJobTitle;

			if (Object.keys(candidateUpdate).length > 0) {
				await tx.candidate.update({
					where: { id: candidate.id },
					data: candidateUpdate,
				});
			}

			if (dto.specialtyIds !== undefined) {
				await tx.candidateSpecialty.deleteMany({
					where: { candidateId: candidate.id },
				});
				if (dto.specialtyIds.length > 0) {
					await tx.candidateSpecialty.createMany({
						data: dto.specialtyIds.map((specialtyId) => ({
							candidateId: candidate.id,
							specialtyId,
						})),
					});
				}
			}

			if (dto.locationIds !== undefined) {
				await tx.candidatePreferredLocation.deleteMany({
					where: { candidateId: candidate.id },
				});
				if (dto.locationIds.length > 0) {
					await tx.candidatePreferredLocation.createMany({
						data: dto.locationIds.map((locationId) => ({
							candidateId: candidate.id,
							locationId,
						})),
					});
				}
			}
		});

		await this.backgroundJobs.enqueueCandidateSummary(candidate.id);

		return { success: true };
	}

	async saveMeResume(userId: string, file: Express.Multer.File) {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true, resumeUrl: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		if (file.mimetype !== "application/pdf") {
			throw new BadRequestException("Resume must be a PDF.");
		}
		if (file.size > MAX_RESUME_SIZE_BYTES) {
			throw new BadRequestException("Resume must be 5MB or less.");
		}

		const previousResumeKey = candidate.resumeUrl;

		const key = `${S3_PREFIX_CANDIDATE_RESUMES}/${userId}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		const storedKey = "key" in result ? result.key : null;

		if (!storedKey) {
			throw new InternalServerErrorException(
				"Could not save your resume. Please try again.",
			);
		}

		await this.prisma.candidate.update({
			where: { id: candidate.id },
			data: { resumeUrl: storedKey },
		});

		await this.backgroundJobs.enqueueCandidateSummary(candidate.id);

		if (previousResumeKey && previousResumeKey !== storedKey) {
			try {
				await this.filesService.deleteFile(previousResumeKey);
			} catch (error) {
				console.error(
					`Failed to delete orphaned resume ${previousResumeKey}:`,
					error,
				);
			}
		}

		return { success: true, resumeUrl: storedKey };
	}

	async saveMeIdentity(
		userId: string,
		dto: SaveOnboardingIdentityDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true },
		});
		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		await this.prisma.candidate.update({
			where: { id: candidate.id },
			data: {
				dateOfBirth: new Date(dto.dateOfBirth),
				lastFourSsn: dto.lastFourSsn,
			},
		});

		return { success: true };
	}

	async saveMeReferences(
		userId: string,
		dto: SaveOnboardingReferencesDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true },
		});
		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.candidateProfessionalReference.deleteMany({
				where: { candidateId: candidate.id },
			});
			await tx.candidateProfessionalReference.createMany({
				data: dto.references.map((r, idx) => ({
					candidateId: candidate.id,
					position: idx,
					fullName: r.fullName,
					title: r.title,
					organization: r.organization,
					relationship: r.relationship,
					phone: r.phone,
					email: r.email,
				})),
			});
		});

		return { success: true };
	}

	async saveMeSkillsChecklist(userId: string, file: Express.Multer.File) {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true, skillsChecklistFileKey: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		const allowed = new Set<string>(SKILLS_CHECKLIST_ALLOWED_MIMES);
		if (!allowed.has(file.mimetype)) {
			throw new BadRequestException(
				"Skills checklist must be a PDF, DOC/DOCX, JPG, or PNG",
			);
		}
		if (file.size > SKILLS_CHECKLIST_MAX_SIZE_BYTES) {
			throw new BadRequestException("Skills checklist must be 10MB or less.");
		}

		const previousKey = candidate.skillsChecklistFileKey;

		const ext = (file.originalname.split(".").pop() ?? "bin").toLowerCase();
		const key = `${S3_PREFIX_CANDIDATE_SKILLS_CHECKLISTS}/${userId}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key);
		const storedKey = "key" in result ? result.key : null;

		if (!storedKey) {
			throw new InternalServerErrorException(
				"Could not save your skills checklist. Please try again.",
			);
		}

		await this.prisma.candidate.update({
			where: { id: candidate.id },
			data: { skillsChecklistFileKey: storedKey },
		});

		if (previousKey && previousKey !== storedKey) {
			try {
				await this.filesService.deleteFile(previousKey);
			} catch (error) {
				console.error(
					`Failed to delete previous skills checklist ${previousKey}:`,
					error,
				);
			}
		}

		return { success: true, skillsChecklistFileKey: storedKey };
	}

	async getMeSkillsChecklistSignedUrl(userId: string): Promise<string | null> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { skillsChecklistFileKey: true },
		});
		if (!candidate?.skillsChecklistFileKey) return null;
		return this.filesService.getSignedUrl(candidate.skillsChecklistFileKey);
	}

	async completeMeInvite(
		userId: string,
		dto: CompleteMeInviteDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: {
				id: true,
				organizationId: true,
				occupationId: true,
				inviteStatus: true,
				onboardingCompletedAt: true,
				streetAddress: true,
				city: true,
				state: true,
				zipCode: true,
				preferredShiftTypes: true,
				preferredContractLengths: true,
				totalProfessionalExperienceBand: true,
				dateOfBirth: true,
				lastFourSsn: true,
				skillsChecklistFileKey: true,
				resumeUrl: true,
				candidateSpecialties: { select: { specialtyId: true } },
				candidatePreferredLocations: { select: { locationId: true } },
				professionalReferences: { select: { id: true } },
			},
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		if (candidate.onboardingCompletedAt) {
			throw new ConflictException("Onboarding already completed.");
		}

		const finalLocationIds =
			dto.locationIds !== undefined
				? dto.locationIds
				: candidate.candidatePreferredLocations.map((l) => l.locationId);

		this.assertOnboardingProfileComplete({
			occupationId: candidate.occupationId,
			streetAddress: candidate.streetAddress,
			city: candidate.city,
			state: candidate.state,
			zipCode: candidate.zipCode,
			specialtyIds: candidate.candidateSpecialties.map((s) => s.specialtyId),
			locationIds: finalLocationIds,
			preferredShiftTypes: candidate.preferredShiftTypes,
			preferredContractLengths: candidate.preferredContractLengths ?? [],
			totalProfessionalExperienceBand:
				candidate.totalProfessionalExperienceBand,
			dateOfBirth: candidate.dateOfBirth,
			lastFourSsn: candidate.lastFourSsn,
			skillsChecklistFileKey: candidate.skillsChecklistFileKey,
			resumeUrl: candidate.resumeUrl,
			referencesCount: candidate.professionalReferences.length,
		});

		await this.assertRequiredQuestionnaireAnswered(
			candidate.id,
			candidate.organizationId,
			candidate.occupationId,
			candidate.candidateSpecialties.map((s) => s.specialtyId),
		);

		const isPendingInvite =
			candidate.inviteStatus === CandidateInviteStatus.PENDING;

		await this.prisma.$transaction(async (tx) => {
			if (dto.locationIds !== undefined) {
				await tx.candidatePreferredLocation.deleteMany({
					where: { candidateId: candidate.id },
				});
				if (dto.locationIds.length > 0) {
					await tx.candidatePreferredLocation.createMany({
						data: dto.locationIds.map((locationId) => ({
							candidateId: candidate.id,
							locationId,
						})),
					});
				}
			}

			await tx.candidate.update({
				where: { id: candidate.id },
				data: {
					onboardingCompletedAt: new Date(),
					...(isPendingInvite
						? {
								inviteStatus: CandidateInviteStatus.ACCEPTED,
								inviteToken: null,
								inviteTokenExpiresAt: null,
							}
						: {}),
				},
			});
		});

		return { success: true };
	}

	async getMeQuestionnaires(
		userId: string,
	): Promise<OnboardingQuestionnairesResponseDto> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: {
				id: true,
				organizationId: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		if (!candidate.organizationId) {
			throw new BadRequestException(
				"Candidate is not associated with an organization",
			);
		}

		const specialtyIds = candidate.candidateSpecialties.map(
			(s) => s.specialtyId,
		);

		const { occupation, specialties } = await this.loadCandidateQuestionnaires(
			candidate.organizationId,
			candidate.occupationId,
			specialtyIds,
		);

		const allQuestionIds = [
			...(occupation?.questions.map((q) => q.id) ?? []),
			...specialties.flatMap((s) => s.questions.map((q) => q.id)),
		];

		const responses = allQuestionIds.length
			? await this.prisma.candidateQuestionnaireResponse.findMany({
					where: {
						candidateId: candidate.id,
						questionId: { in: allQuestionIds },
					},
					select: { questionId: true, value: true },
				})
			: [];

		const answers: Record<string, string> = {};
		for (const r of responses) {
			answers[r.questionId] = r.value;
		}

		return { occupation, specialties, answers };
	}

	async saveMeQuestionnaireAnswers(
		userId: string,
		dto: SaveOnboardingQuestionnaireAnswersDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: {
				id: true,
				organizationId: true,
				occupationId: true,
				candidateSpecialties: { select: { specialtyId: true } },
			},
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found.");
		}

		if (!candidate.organizationId) {
			throw new BadRequestException(
				"Candidate is not associated with an organization",
			);
		}

		if (dto.answers.length === 0) {
			return { success: true };
		}

		const allowedQuestionIds = await this.collectAllowedQuestionIds(
			candidate.organizationId,
			candidate.occupationId,
			candidate.candidateSpecialties.map((s) => s.specialtyId),
		);

		const invalid = dto.answers.find(
			(a) => !allowedQuestionIds.has(a.questionId),
		);
		if (invalid) {
			throw new BadRequestException(
				"One or more answers reference a question that is not part of your questionnaires.",
			);
		}

		await this.prisma.$transaction(async (tx) => {
			for (const answer of dto.answers) {
				await tx.candidateQuestionnaireResponse.upsert({
					where: {
						candidateId_questionId: {
							candidateId: candidate.id,
							questionId: answer.questionId,
						},
					},
					create: {
						candidateId: candidate.id,
						questionId: answer.questionId,
						value: answer.value,
					},
					update: { value: answer.value },
				});
			}
		});

		await this.backgroundJobs.enqueueCandidateSummary(candidate.id);

		return { success: true };
	}

	private assertOnboardingProfileComplete(input: {
		occupationId: string | null;
		streetAddress: string | null;
		city: string | null;
		state: string | null;
		zipCode: string | null;
		specialtyIds: string[];
		locationIds: string[];
		preferredShiftTypes: string[];
		preferredContractLengths: unknown[];
		totalProfessionalExperienceBand: CandidateExperienceBand | null;
		dateOfBirth: Date | null;
		lastFourSsn: string | null;
		skillsChecklistFileKey: string | null;
		resumeUrl: string | null;
		referencesCount: number;
	}): void {
		if (!input.occupationId) {
			throw new BadRequestException("Select an occupation.");
		}
		if (!input.streetAddress || !input.city || !input.state || !input.zipCode) {
			throw new BadRequestException("Enter a complete contact address.");
		}
		if (input.specialtyIds.length === 0) {
			throw new BadRequestException("Select at least one specialty.");
		}
		if (!input.resumeUrl) {
			throw new BadRequestException("Upload your resume.");
		}
		if (input.locationIds.length === 0) {
			throw new BadRequestException("Select at least one preferred location.");
		}
		if (input.preferredShiftTypes.length === 0) {
			throw new BadRequestException(
				"Select at least one preferred shift type.",
			);
		}
		if (input.preferredContractLengths.length === 0) {
			throw new BadRequestException(
				"Select at least one preferred contract length.",
			);
		}
		if (!input.totalProfessionalExperienceBand) {
			throw new BadRequestException(
				"Select your total professional experience.",
			);
		}
		if (!input.dateOfBirth) {
			throw new BadRequestException("Enter your date of birth.");
		}
		if (!input.lastFourSsn || !/^\d{4}$/.test(input.lastFourSsn)) {
			throw new BadRequestException("Enter the last 4 digits of your SSN.");
		}
		if (!input.skillsChecklistFileKey) {
			throw new BadRequestException("Upload your skills checklist.");
		}
	}

	private async assertRequiredQuestionnaireAnswered(
		candidateId: string,
		organizationId: string | null,
		occupationId: string | null,
		specialtyIds: string[],
	): Promise<void> {
		if (!organizationId) {
			return;
		}

		const { occupation, specialties } = await this.loadCandidateQuestionnaires(
			organizationId,
			occupationId,
			specialtyIds,
		);

		const requiredIds = [
			...(occupation?.questions ?? []),
			...specialties.flatMap((s) => s.questions),
		]
			.filter((q) => q.required)
			.map((q) => q.id);

		if (requiredIds.length === 0) {
			return;
		}

		const answered = await this.prisma.candidateQuestionnaireResponse.findMany({
			where: {
				candidateId,
				questionId: { in: requiredIds },
				NOT: { value: "" },
			},
			select: { questionId: true },
		});

		const answeredIds = new Set(answered.map((a) => a.questionId));
		const missing = requiredIds.filter((id) => !answeredIds.has(id));
		if (missing.length > 0) {
			throw new BadRequestException(
				"Answer all required questionnaire questions before completing onboarding",
			);
		}
	}

	private async loadCandidateQuestionnaires(
		organizationId: string,
		occupationId: string | null,
		specialtyIds: string[],
	): Promise<{
		occupation: OnboardingQuestionnaireScopeDto | null;
		specialties: OnboardingQuestionnaireScopeDto[];
	}> {
		if (!occupationId) {
			return { occupation: null, specialties: [] };
		}

		const orgOccupation = await this.prisma.organizationOccupation.findFirst({
			where: { organizationId, occupationId },
			select: {
				id: true,
				occupation: { select: { name: true } },
			},
		});

		if (!orgOccupation) {
			return { occupation: null, specialties: [] };
		}

		const occQuestionnaire = await this.prisma.questionnaire.findFirst({
			where: {
				organizationId,
				occupationId: orgOccupation.id,
				active: true,
			},
			select: {
				id: true,
				questions: {
					select: {
						id: true,
						questionText: true,
						type: true,
						options: true,
						required: true,
						includeInSubmission: true,
						order: true,
					},
					orderBy: [{ order: "asc" }, { createdAt: "asc" }],
				},
			},
		});

		const occupationScope: OnboardingQuestionnaireScopeDto | null =
			occQuestionnaire
				? {
						id: orgOccupation.id,
						name: orgOccupation.occupation.name,
						questionnaireId: occQuestionnaire.id,
						questions: occQuestionnaire.questions,
					}
				: null;

		const specialtyScopes: OnboardingQuestionnaireScopeDto[] = [];

		if (specialtyIds.length > 0) {
			const orgSpecialties = await this.prisma.organizationSpecialty.findMany({
				where: {
					organizationId,
					organizationOccupationId: orgOccupation.id,
					specialtyId: { in: specialtyIds },
				},
				select: {
					id: true,
					specialty: { select: { name: true } },
					questionnaires: {
						where: { active: true },
						select: {
							id: true,
							questions: {
								select: {
									id: true,
									questionText: true,
									type: true,
									options: true,
									required: true,
									includeInSubmission: true,
									order: true,
								},
								orderBy: [{ order: "asc" }, { createdAt: "asc" }],
							},
						},
					},
				},
				orderBy: { createdAt: "asc" },
			});

			for (const os of orgSpecialties) {
				const qn = os.questionnaires;
				if (!qn) continue;
				specialtyScopes.push({
					id: os.id,
					name: os.specialty.name,
					questionnaireId: qn.id,
					questions: qn.questions,
				});
			}
		}

		return { occupation: occupationScope, specialties: specialtyScopes };
	}

	private async collectAllowedQuestionIds(
		organizationId: string,
		occupationId: string | null,
		specialtyIds: string[],
	): Promise<Set<string>> {
		const { occupation, specialties } = await this.loadCandidateQuestionnaires(
			organizationId,
			occupationId,
			specialtyIds,
		);
		const ids = new Set<string>();
		for (const q of occupation?.questions ?? []) ids.add(q.id);
		for (const s of specialties) for (const q of s.questions) ids.add(q.id);
		return ids;
	}

	async getMeResumeSignedUrl(userId: string): Promise<string | null> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true, resumeUrl: true },
		});

		if (!candidate?.resumeUrl) return null;
		return this.filesService.getSignedUrl(candidate.resumeUrl);
	}
}
