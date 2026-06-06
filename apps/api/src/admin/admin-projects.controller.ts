import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

const PROJECT_ROLES = ["OWNER", "DEPLOYER", "VIEWER"] as const;
type ProjectRoleName = (typeof PROJECT_ROLES)[number];

function assertProjectRole(role: unknown): asserts role is ProjectRoleName {
  if (typeof role !== "string" || !(PROJECT_ROLES as readonly string[]).includes(role)) {
    throw new BadRequestException(
      `role must be one of ${PROJECT_ROLES.join(", ")}`,
    );
  }
}
import type { PrismaClient } from "@heizen/db";
import { PRISMA } from "../prisma/prisma.module";
import { AuthGuard } from "../common/guards/auth.guard";
import { SystemRoleGuard, RequireSystemRole } from "../common/rbac";
import { AuditLogService } from "../audit/audit.service";

@Controller("api/admin/projects")
@UseGuards(AuthGuard, SystemRoleGuard)
@RequireSystemRole("ADMIN")
export class AdminProjectsController {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly audit: AuditLogService,
  ) {}

  @Get()
  async list() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        githubOwner: true,
        githubRepo: true,
        githubInstallationId: true,
        createdAt: true,
        _count: { select: { members: true, environments: true } },
      },
    });
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: Request & { user: { id: string } }) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException("Project not found");

    await this.prisma.$transaction(async (tx) => {
      await tx.project.delete({ where: { id } });

      await this.audit.logInTx(tx, {
        actorId: req.user.id,
        action: "PROJECT_DELETED",
        resourceType: "PROJECT",
        resourceId: id,
        metadata: { name: project.name, slug: project.slug },
      });
    });

    return { ok: true };
  }

  @Get(":id/members")
  async listMembers(@Param("id") id: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  }

  @Post(":id/members")
  async addMember(
    @Param("id") projectId: string,
    @Body() body: { userId: string; role: "OWNER" | "DEPLOYER" | "VIEWER" },
    @Req() req: Request & { user: { id: string } },
  ) {
    assertProjectRole(body.role);
    if (!body.userId) throw new BadRequestException("userId is required");

    const [project, user] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { id: body.userId }, select: { id: true } }),
    ]);
    if (!project) throw new NotFoundException("Project not found");
    if (!user) throw new NotFoundException("User not found");

    const result = await this.prisma.$transaction(async (tx) => {
      const upserted = await tx.projectMember.upsert({
        where: { userId_projectId: { userId: body.userId, projectId } },
        create: { userId: body.userId, projectId, role: body.role },
        update: { role: body.role },
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      await this.audit.logInTx(tx, {
        actorId: req.user.id,
        action: "PROJECT_MEMBER_ADDED",
        resourceType: "PROJECT_MEMBER",
        resourceId: upserted.id,
        metadata: { projectId, userId: body.userId, role: body.role },
      });

      return upserted;
    });

    return result;
  }

  @Patch(":id/members/:userId")
  async updateMember(
    @Param("id") projectId: string,
    @Param("userId") userId: string,
    @Body() body: { role: "OWNER" | "DEPLOYER" | "VIEWER" },
    @Req() req: Request & { user: { id: string } },
  ) {
    assertProjectRole(body.role);

    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) throw new NotFoundException("Member not found");

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.projectMember.update({
        where: { userId_projectId: { userId, projectId } },
        data: { role: body.role },
        select: { id: true, role: true },
      });

      await this.audit.logInTx(tx, {
        actorId: req.user.id,
        action: "PROJECT_MEMBER_ROLE_CHANGED",
        resourceType: "PROJECT_MEMBER",
        resourceId: member.id,
        metadata: { projectId, userId, from: member.role, to: body.role },
      });

      return result;
    });

    return updated;
  }

  @Delete(":id/members/:userId")
  async removeMember(
    @Param("id") projectId: string,
    @Param("userId") userId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) throw new NotFoundException("Member not found");

    await this.prisma.$transaction(async (tx) => {
      await tx.projectMember.delete({
        where: { userId_projectId: { userId, projectId } },
      });

      await this.audit.logInTx(tx, {
        actorId: req.user.id,
        action: "PROJECT_MEMBER_REMOVED",
        resourceType: "PROJECT_MEMBER",
        resourceId: member.id,
        metadata: { projectId, userId },
      });
    });

    return { ok: true };
  }
}
