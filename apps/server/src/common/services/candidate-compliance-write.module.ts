import { Module } from "@nestjs/common";
import { FilesModule } from "src/files/files.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { CandidateComplianceWriteService } from "./candidate-compliance-write.service";

@Module({
	imports: [PrismaModule, FilesModule],
	providers: [CandidateComplianceWriteService],
	exports: [CandidateComplianceWriteService],
})
export class CandidateComplianceWriteModule {}
