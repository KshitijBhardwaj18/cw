import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import {
	CandidateInviteStatus,
	type CandidatePreferredContractLength,
} from "@repo/db";
import { S3_PREFIX_CANDIDATE_RESUMES } from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { FilesService } from "src/files/files.service";
import { PrismaService } from "src/prisma/prisma.service";
import { MAX_RESUME_SIZE_BYTES } from "../constants";
import { type CompleteMeInviteDto } from "../dto/complete-me-invite.dto";
import { type OnboardingProgressMePatchDto } from "../dto/onboarding-progress-me-patch.dto";

type OnboardingProgressMeResponse = {
	name: string;
	email: string;
	organizationId: string;
	organizationName: string;
	occupationId: string;
	occupationName: string;
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	yearsOfExperience?: number | null;
	specialtyIds: string[];
	locationIds: string[];
	specialties: { id: string; name: string }[];
	locations: {
		id: string;
		name: string;
		city: string | null;
		state: string | null;
	}[];
	preferredShiftTypes: string[];
	willingToRelocate: boolean;
	resumeUrl: string | null;
	showProfileBanner: boolean;
	preferredContractLengths: CandidatePreferredContractLength[];
	inviteStatus: CandidateInviteStatus | null;
};

@Injectable()
export class CandidatesOnboardingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	async getMeOnboarding(userId: string): Promise<OnboardingProgressMeResponse> {
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
			},
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found");
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
			yearsOfExperience: candidate.yearsOfExperience ?? null,
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
		};
	}

	async dismissProfileBanner(userId: string): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found");
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
			throw new BadRequestException("Candidate profile not found");
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
			if (dto.yearsOfExperience !== undefined)
				candidateUpdate.yearsOfExperience = dto.yearsOfExperience;
			if (dto.preferredShiftTypes !== undefined)
				candidateUpdate.preferredShiftTypes = dto.preferredShiftTypes;
			if (dto.willingToRelocate !== undefined)
				candidateUpdate.willingToRelocate = dto.willingToRelocate;
			if (dto.preferredContractLengths !== undefined)
				candidateUpdate.preferredContractLengths = dto.preferredContractLengths;

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
			throw new BadRequestException("Candidate profile not found");
		}

		if (file.mimetype !== "application/pdf") {
			throw new BadRequestException("Resume must be a PDF");
		}
		if (file.size > MAX_RESUME_SIZE_BYTES) {
			throw new BadRequestException("Resume must be 5MB or less");
		}

		const previousResumeKey = candidate.resumeUrl;

		const key = `${S3_PREFIX_CANDIDATE_RESUMES}/${userId}/${randomUUID()}.pdf`;
		const result = await this.filesService.uploadFile(file, key);
		const storedKey = "key" in result ? result.key : null;

		if (!storedKey) {
			throw new Error("Failed to process resume upload");
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

	async completeMeInvite(
		userId: string,
		dto: CompleteMeInviteDto,
	): Promise<{ success: boolean }> {
		const candidate = await this.prisma.candidate.findUnique({
			where: { userId },
			select: { id: true, inviteStatus: true },
		});

		if (!candidate) {
			throw new BadRequestException("Candidate profile not found");
		}

		if (candidate.inviteStatus !== CandidateInviteStatus.PENDING) {
			throw new ForbiddenException(
				"Invite already completed or not applicable",
			);
		}

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
					inviteStatus: CandidateInviteStatus.ACCEPTED,
					inviteToken: null,
					inviteTokenExpiresAt: null,
				},
			});
		});

		return { success: true };
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
