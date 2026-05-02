import { PartialType } from "@nestjs/swagger";
import { CreateMspDto } from "./create-msp.dto";

export class UpdateMspDto extends PartialType(CreateMspDto) {}
