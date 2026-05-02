import type { PureAbility } from "@casl/ability";
import type { PrismaQuery } from "@casl/prisma";
import type { Action } from "./actions";
import type { AppSubjects } from "./subjects";

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;
