import { Module } from "@nestjs/common";
import { BackgroundJobsModule } from "src/background-jobs/background-jobs.module";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { VendorsModule } from "src/vendors/vendors.module";
import { BulkUsersController } from "./controllers/bulk-users.controller";
import { OrgMembersController } from "./controllers/org-members.controller";
import { OrgPortalDelegationController } from "./controllers/org-portal-delegation.controller";
import { ProgramUsersController } from "./controllers/program-users.controller";
import { UsersController } from "./controllers/users.controller";
import { UsersSelfController } from "./controllers/users-self.controller";
import { VendorUsersController } from "./controllers/vendor-users.controller";
import { BulkUsersService } from "./services/bulk-users.service";
import { OrgMembersService } from "./services/org-members.service";
import { OrgPortalDelegationService } from "./services/org-portal-delegation.service";
import { ProgramUsersService } from "./services/program-users.service";
import { UsersService } from "./services/users.service";
import { VendorUsersService } from "./services/vendor-users.service";

@Module({
	imports: [PrismaModule, FilesModule, BackgroundJobsModule, VendorsModule],
	controllers: [
		UsersController,
		UsersSelfController,
		ProgramUsersController,
		BulkUsersController,
		VendorUsersController,
		OrgMembersController,
		OrgPortalDelegationController,
	],
	providers: [
		UsersService,
		ProgramUsersService,
		BulkUsersService,
		VendorUsersService,
		OrgMembersService,
		OrgPortalDelegationService,
	],
	exports: [UsersService, OrgMembersService],
})
export class UsersModule {}
