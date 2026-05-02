import { InvoiceStatus } from "@repo/db";
import { IsIn, IsString } from "class-validator";

export class UpdateInvoiceStatusDto {
	@IsString()
	@IsIn(Object.values(InvoiceStatus))
	status: InvoiceStatus;
}
