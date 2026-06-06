import { Module } from "@nestjs/common";
import { AdminUsersController } from "./admin-users.controller";
import { AdminProjectsController } from "./admin-projects.controller";
import { AdminSystemController } from "./admin-system.controller";

@Module({
  controllers: [AdminUsersController, AdminProjectsController, AdminSystemController],
})
export class AdminModule {}
