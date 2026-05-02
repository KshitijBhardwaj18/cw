import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "../files/files.module";
import { MatchingLogicModule } from "../matching-logic/matchinglogic.module";
import { TaggingRulesModule } from "../tagging-rules/tagging-rules.module";
import { OrganizationDepartmentsController } from "./controllers/organization-departments.controller";
import { OrganizationLocationsController } from "./controllers/organization-locations.controller";
import { OrganizationsController } from "./controllers/organizations.controller";
import { OrgDepartmentsService } from "./services/org-departments.service";
import { OrgLocationsService } from "./services/org-locations.service";
import { OrganizationsService } from "./services/organizations.service";

@Module({
	imports: [
		FilesModule,
		MatchingLogicModule,
		TaggingRulesModule,
		BackgroundJobsModule,
	],
	controllers: [
		OrganizationsController,
		OrganizationLocationsController,
		OrganizationDepartmentsController,
	],
	providers: [OrganizationsService, OrgLocationsService, OrgDepartmentsService],
	exports: [OrganizationsService],
})
export class OrganizationsModule {}
