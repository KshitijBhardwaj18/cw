import { Module } from "@nestjs/common";
import { FilesModule } from "../files/files.module";
import { OrganizationVendorsController } from "./controllers/organization-vendors.controller";
import { VendorsController } from "./controllers/vendors.controller";
import { OrgVendorsService } from "./services/org-vendors.service";
import { VendorsService } from "./services/vendors.service";

@Module({
	imports: [FilesModule],
	controllers: [VendorsController, OrganizationVendorsController],
	providers: [VendorsService, OrgVendorsService],
	exports: [VendorsService, OrgVendorsService],
})
export class VendorsModule {}
