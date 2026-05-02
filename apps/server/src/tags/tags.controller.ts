import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Action } from "@repo/casl";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { PermissionsGuard } from "src/common/guards/permissions.guard";
import { CreateTagDto } from "./dto/create-tag.dto";
import { PaginatedTagsQueryDto } from "./dto/paginated-tags.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { TagsService } from "./tags.service";

@ApiTags("tags")
@Controller("tags")
@UseGuards(PermissionsGuard)
export class TagsController {
	constructor(private readonly tagsService: TagsService) {}

	@Get()
	@ApiOperation({ summary: "List tags with search, filters and pagination" })
	@ApiResponse({ status: 200, description: "Paginated list of tags" })
	@Permissions({ action: Action.List, subject: "Tag" })
	async getTags(@Query() query: PaginatedTagsQueryDto) {
		return this.tagsService.findAll(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get tag by ID" })
	@ApiResponse({ status: 200, description: "Tag details" })
	@ApiResponse({ status: 404, description: "Tag not found" })
	@Permissions({ action: Action.Read, subject: "Tag" })
	async getTagById(@Param("id") id: string) {
		return this.tagsService.findOne(id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new tag" })
	@ApiResponse({ status: 201, description: "Tag created successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@Permissions({ action: Action.Create, subject: "Tag" })
	async createTag(
		@Body() createTagDto: CreateTagDto,
		@Session() session: UserSession,
	) {
		return this.tagsService.create(createTagDto, session.user.id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a tag" })
	@ApiResponse({ status: 200, description: "Tag updated successfully" })
	@ApiResponse({ status: 400, description: "Validation error" })
	@ApiResponse({ status: 404, description: "Tag not found" })
	@Permissions({ action: Action.Update, subject: "Tag" })
	async updateTag(@Param("id") id: string, @Body() updateTagDto: UpdateTagDto) {
		return this.tagsService.update(id, updateTagDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a tag" })
	@ApiResponse({ status: 204, description: "Tag deleted successfully" })
	@ApiResponse({ status: 404, description: "Tag not found" })
	@ApiResponse({ status: 403, description: "Forbidden" })
	@Permissions({ action: Action.Delete, subject: "Tag" })
	async deleteTag(@Param("id") id: string): Promise<void> {
		return this.tagsService.delete(id);
	}
}
