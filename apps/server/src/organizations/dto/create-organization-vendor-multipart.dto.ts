import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateOrganizationVendorMultipartDto {
	@ApiProperty({
		description:
			"JSON string of organization vendor data (vendorId, status, startDate, notes)",
		example:
			'{"vendorId":"uuid","status":"PENDING","startDate":"2025-01-15","notes":"Optional notes"}',
	})
	@IsString()
	@IsNotEmpty({ message: "Data is required" })
	data: string;
}
