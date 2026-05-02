import { PartialType } from "@nestjs/swagger";
import { CreateRequisitionTemplateDto } from "./create-requisition-template.dto";

export class UpdateRequisitionTemplateDto extends PartialType(
	CreateRequisitionTemplateDto,
) {}
