import { Module } from "@nestjs/common";
import { RequisitionAttentionRulesController } from "./controllers/requisition-attention-rules.controller";
import { RequisitionAttentionRulesService } from "./services/requisition-attention-rules.service";

@Module({
	controllers: [RequisitionAttentionRulesController],
	providers: [RequisitionAttentionRulesService],
	exports: [RequisitionAttentionRulesService],
})
export class RequisitionAttentionRulesModule {}
