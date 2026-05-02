import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import type { CombinationsFilter } from "@repo/shared";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { ComplianceWalletTemplateService } from "./compliance-wallet-template.service";
import { CombinationsQueryDto } from "./dto/combinations-query.dto";
import { UpdateWalletItemsDto } from "./dto/update-wallet-items.dto";

@Controller("compliance-wallet-templates")
@ApiTags("Compliance Wallet Templates")
@UseGuards(PermissionsGuard)
export class ComplianceWalletTemplateController {
	constructor(
		private readonly complianceWalletTemplateService: ComplianceWalletTemplateService,
	) {}

	@Get("org/:organizationId/combinations")
	@Permissions({ action: Action.List, subject: "ComplianceWalletTemplate" })
	async getCombinations(
		@Param("organizationId") organizationId: string,
		@Query() query: CombinationsQueryDto,
	) {
		return this.complianceWalletTemplateService.getCombinations(
			organizationId,
			query.page ?? 1,
			query.limit ?? 10,
			query.search,
			(query.filter ?? "all") as CombinationsFilter,
		);
	}

	@Get("org/:organizationId/wallet/:id")
	@Permissions({ action: Action.Read, subject: "ComplianceWalletTemplate" })
	async getWalletTemplate(
		@Param("organizationId") organizationId: string,
		@Param("id") id: string,
	) {
		return this.complianceWalletTemplateService.getById(id, organizationId);
	}

	@Patch("org/:organizationId/wallet/:id/items")
	@Permissions({ action: Action.Update, subject: "ComplianceWalletTemplate" })
	async updateWalletItems(
		@Param("organizationId") organizationId: string,
		@Param("id") id: string,
		@Body() dto: UpdateWalletItemsDto,
		@Session() session: UserSession,
	) {
		return this.complianceWalletTemplateService.updateItems(
			id,
			organizationId,
			dto.complianceListItemIds,
			session.user.id,
		);
	}

	@Delete("org/:organizationId/wallet/:id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@Permissions({ action: Action.Delete, subject: "ComplianceWalletTemplate" })
	async deleteWalletTemplate(
		@Param("organizationId") organizationId: string,
		@Param("id") id: string,
	): Promise<void> {
		return this.complianceWalletTemplateService.delete(id, organizationId);
	}
}
