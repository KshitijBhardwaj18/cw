import { randomUUID } from "node:crypto";
import type { MessageEvent } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import type { AppAbility } from "@repo/casl";
import { UserRole } from "@repo/db";
import type { BulkPlatformUsersJobResult } from "@repo/shared";
import { S3_PREFIX_BULK_PLATFORM_USERS } from "@repo/shared";
import { Observable } from "rxjs";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { FilesService } from "src/files/files.service";
import type { CreateProgramUserDto } from "../dto/program-user.dto";
import { ProgramUsersService } from "./program-users.service";

@Injectable()
export class BulkUsersService {
	constructor(
		private readonly filesService: FilesService,
		private readonly backgroundJobsService: BackgroundJobsService,
		private readonly programUsersService: ProgramUsersService,
	) {}

	private assertNotOrgUserActor(actorRole: UserRole): void {
		if (actorRole === UserRole.ORGANIZATION_USER) {
			throw new ForbiddenException(
				"Organization users manage colleagues under the organization, not via program user endpoints.",
			);
		}
	}

	async createBulkProgramUsers(
		users: CreateProgramUserDto[],
		ability: AppAbility,
		actorRole: UserRole,
	) {
		this.assertNotOrgUserActor(actorRole);
		return Promise.all(
			users.map((u) =>
				this.programUsersService.createProgramUser(u, ability, actorRole),
			),
		);
	}

	async submitBulkPlatformUsers(
		file: Express.Multer.File,
		actorRole: UserRole,
	) {
		this.assertNotOrgUserActor(actorRole);
		const s3Key = `${S3_PREFIX_BULK_PLATFORM_USERS}/${randomUUID()}.csv`;
		await this.filesService.uploadFile(file, s3Key);
		const fileName = file.originalname ?? "platform-users.csv";
		try {
			return await this.backgroundJobsService.createBulkPlatformUsersJob(
				s3Key,
				fileName,
			);
		} catch (error) {
			await this.filesService.deleteFile(s3Key).catch(() => {});
			throw error;
		}
	}

	async getBulkPlatformUsersJob(jobId: string) {
		return this.backgroundJobsService.getJobById(jobId);
	}

	streamBulkPlatformUsersJob(jobId: string): Observable<MessageEvent> {
		const POLL_MS = 2000;
		const TIMEOUT_MS = 10 * 60 * 1000;
		return new Observable<MessageEvent>((subscriber) => {
			let pollTimer: ReturnType<typeof setInterval> | null = null;
			let timeoutId: ReturnType<typeof setTimeout> | null = null;
			let settled = false;

			const cleanup = () => {
				if (pollTimer !== null) {
					clearInterval(pollTimer);
					pollTimer = null;
				}
				if (timeoutId !== null) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
			};

			const settle = (data: object) => {
				if (settled) return;
				settled = true;
				subscriber.next({ data } as MessageEvent);
				subscriber.complete();
				cleanup();
			};

			const poll = () => {
				this.getBulkPlatformUsersJob(jobId)
					.then((job) => {
						if (settled) return;
						if (job.status === "COMPLETED") {
							const r = job.result as BulkPlatformUsersJobResult | null;
							settle({
								phase: "completed",
								created: r?.created ?? 0,
								skipped: r?.skipped ?? 0,
								failed: r?.failed ?? 0,
								errors: r?.errors,
							});
							return;
						}
						if (job.status === "FAILED") {
							const r = job.result as {
								errors?: Array<{ message: string }>;
							} | null;
							settle({
								phase: "failed",
								message: r?.errors?.[0]?.message ?? "Job failed",
							});
							return;
						}
						subscriber.next({
							data: { phase: "processing" },
						} as MessageEvent);
					})
					.catch((err) => {
						if (!settled) {
							settled = true;
							subscriber.error(err);
							cleanup();
						}
					});
			};

			poll();
			pollTimer = setInterval(poll, POLL_MS);
			timeoutId = setTimeout(
				() => settle({ phase: "failed", message: "Job timed out" }),
				TIMEOUT_MS,
			);

			return cleanup;
		});
	}
}
