import { SetMetadata } from "@nestjs/common";
import type { Action, AppSubjects } from "@repo/casl";

export const PERMISSIONS = "permissions";

export interface RequiredAbility {
	action: Action;
	subject: AppSubjects;
}

export const Permissions = (...abilities: RequiredAbility[]) =>
	SetMetadata(PERMISSIONS, abilities);
