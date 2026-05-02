import { enumToTitleText, UserRole, UserStatus } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useMemo } from "react";
import type { BulkImportUserRow, MspOptionDto } from "@/types";

const STATUS_OPTIONS = Object.values(UserStatus);

interface UseBulkPlatformUserColumnsProps {
	updateUser: (
		id: string,
		field: keyof BulkImportUserRow,
		value: string,
	) => void;
	removeUser: (id: string) => void;
	mspOptions: MspOptionDto[];
	baseRoles: UserRole[];
}

export const useBulkPlatformUserColumns = ({
	updateUser,
	removeUser,
	mspOptions,
	baseRoles,
}: UseBulkPlatformUserColumnsProps) => {
	const columns = useMemo<ColumnDef<BulkImportUserRow>[]>(
		() => [
			{
				accessorKey: "firstName",
				header: "First Name",
				cell: ({ row }) => (
					<Input
						value={row.original.firstName}
						onChange={(e) =>
							updateUser(row.original.id, "firstName", e.target.value)
						}
						className="min-w-[120px]"
					/>
				),
			},
			{
				accessorKey: "lastName",
				header: "Last Name",
				cell: ({ row }) => (
					<Input
						value={row.original.lastName}
						onChange={(e) =>
							updateUser(row.original.id, "lastName", e.target.value)
						}
						className="min-w-[120px]"
					/>
				),
			},
			{
				accessorKey: "title",
				header: "Job Title",
				cell: ({ row }) => (
					<Input
						value={row.original.title}
						onChange={(e) =>
							updateUser(row.original.id, "title", e.target.value)
						}
						className="min-w-[150px]"
					/>
				),
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => (
					<Input
						type="email"
						value={row.original.email}
						onChange={(e) =>
							updateUser(row.original.id, "email", e.target.value)
						}
						className="min-w-[180px]"
					/>
				),
			},
			{
				accessorKey: "officePhone",
				header: "Office Phone",
				cell: ({ row }) => (
					<Input
						value={row.original.officePhone}
						onChange={(e) =>
							updateUser(row.original.id, "officePhone", e.target.value)
						}
						className="min-w-[130px]"
					/>
				),
			},
			{
				accessorKey: "phoneNumber",
				header: "Mobile Phone",
				cell: ({ row }) => (
					<Input
						value={row.original.phoneNumber}
						onChange={(e) =>
							updateUser(row.original.id, "phoneNumber", e.target.value)
						}
						className="min-w-[130px]"
					/>
				),
			},
			{
				accessorKey: "mspId",
				header: "MSP Partner",
				cell: ({ row }) => (
					<Select
						value={row.original.mspId ?? undefined}
						onValueChange={(val) =>
							updateUser(row.original.id, "mspId", val ?? null)
						}
					>
						<SelectTrigger className="min-w-[150px]">
							<SelectValue placeholder="Select MSP" />
						</SelectTrigger>
						<SelectContent>
							{mspOptions.map((option) => (
								<SelectItem key={option.id} value={option.id}>
									{option.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				),
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: ({ row }) => {
					const roleOptions = row.original.mspId
						? [UserRole.PROGRAM_MANAGER, UserRole.COMPLIANCE_MANAGER]
						: baseRoles;

					return (
						<Select
							value={row.original.role}
							onValueChange={(val) =>
								updateUser(row.original.id, "role", val as UserRole)
							}
						>
							<SelectTrigger className="min-w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{roleOptions.map((role) => (
									<SelectItem key={role} value={role}>
										{enumToTitleText(role)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				},
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Select
						value={row.original.status}
						onValueChange={(val) =>
							updateUser(row.original.id, "status", val as UserStatus)
						}
					>
						<SelectTrigger className="min-w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUS_OPTIONS.map((status) => (
								<SelectItem key={status} value={status}>
									{enumToTitleText(status)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeUser(row.original.id)}
					>
						<X className="h-4 w-4" />
					</Button>
				),
			},
		],
		[updateUser, removeUser, mspOptions, baseRoles],
	);
	return { columns };
};
