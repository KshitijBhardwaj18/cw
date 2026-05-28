import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AgingRulesModule } from "./aging-rules/aging-rules.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BackgroundJobsModule } from "./background-jobs/background-jobs.module";
import { BillingModule } from "./billing/billing.module";
import { CandidatesModule } from "./candidates/candidates.module";
import { CommandCenterModule } from "./command-center/command-center.module";
import { authAdmin, authOrg } from "./common/auth";
import { AuthHooksService } from "./common/auth-hooks.service";
import { heizenLoggerConfig } from "./common/openobserve";
import { PortalAuthGuard } from "./common/portal-auth.guard";
import { TenantAffinityGuard } from "./common/tenant-affinity.guard";
import { ComplianceModule } from "./compliance/compliance.module";
import { ComplianceChecklistModule } from "./compliance-checklist/compliance-checklist.module";
import { ComplianceWalletTemplateModule } from "./compliance-wallet-template/compliance-wallet-template.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DocumentsModule } from "./documents/documents.module";
import { FilesModule } from "./files/files.module";
import { GrievancesModule } from "./grievances/grievances.module";
import { MatchingLogicModule } from "./matching-logic/matchinglogic.module";
import { MetricsModule } from "./metrics/metrics.module";
import { MspsModule } from "./msps/msps.module";
import { NotesModule } from "./notes/notes.module";
import { OccupationsModule } from "./occupations/occupations.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { PerDiemShiftsModule } from "./per-diem-shifts/per-diem-shifts.module";
import { PlacementsModule } from "./placements/placements.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectsModule } from "./projects/projects.module";
import { QuestionnaireModule } from "./questionnaire/questionnaire.module";
import { RequisitionAttentionRulesModule } from "./requisition-attention-rules/requisition-attention-rules.module";
import { RequisitionTemplatesModule } from "./requisition-templates/requisition-templates.module";
import { RequisitionsModule } from "./requisitions/requisitions.module";
import { ShiftRoutingModule } from "./shift-routing/shift-routing.module";
import { ShiftTemplatesModule } from "./shift-templates/shift-templates.module";
import { SpecialtiesModule } from "./specialties/specialties.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { TagsModule } from "./tags/tags.module";
import { TalentCommunityModule } from "./talent-community/talent-community.module";
import { TimekeepingModule } from "./timekeeping/timekeeping.module";
import { UsersModule } from "./users/users.module";
import { VendorsModule } from "./vendors/vendors.module";
import { WorkforceListsModule } from "./workforce-lists/workforce-lists.module";

@Module({
	imports: [
		...(heizenLoggerConfig ? [heizenLoggerConfig] : []),
		PrismaModule,
		AuthModule.forRoot({
			auth: authAdmin,
			disableGlobalAuthGuard: true,
			disableTrustedOriginsCors: true,
			isGlobal: false,
		}),
		AuthModule.forRoot({
			auth: authOrg,
			disableGlobalAuthGuard: true,
			disableTrustedOriginsCors: true,
			isGlobal: false,
		}),
		DocumentsModule,
		MatchingLogicModule,
		MetricsModule,
		MspsModule,
		NotesModule,
		OrganizationsModule,
		UsersModule,
		OccupationsModule,
		SpecialtiesModule,
		VendorsModule,
		TagsModule,
		ComplianceModule,
		ComplianceChecklistModule,
		ComplianceWalletTemplateModule,
		QuestionnaireModule,
		FilesModule,
		GrievancesModule,
		DashboardModule,
		BackgroundJobsModule,
		CommandCenterModule,
		BillingModule,
		TalentCommunityModule,
		CandidatesModule,
		ShiftTemplatesModule,
		ShiftRoutingModule,
		WorkforceListsModule,
		PerDiemShiftsModule,
		AgingRulesModule,
		RequisitionAttentionRulesModule,
		RequisitionTemplatesModule,
		RequisitionsModule,
		ProjectsModule,
		PlacementsModule,
		SubmissionsModule,
		TimekeepingModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		AuthHooksService,
		{ provide: APP_GUARD, useClass: PortalAuthGuard },
		{ provide: APP_GUARD, useClass: TenantAffinityGuard },
	],
})
export class AppModule {}
