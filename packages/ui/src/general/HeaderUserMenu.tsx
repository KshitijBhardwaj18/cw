"use client";

import { enumToText, getInitials } from "@repo/shared";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export type HeaderUserMenuProps = {
	user: {
		name?: string | null;
		email?: string | null;
		role?: string | null;
		subRole?: string | null;
	};
	onLogout: () => void | Promise<void>;
	profileLink?: string;
};

const HeaderUserMenu = ({
	user,
	onLogout,
	profileLink = "/profile",
}: Readonly<HeaderUserMenuProps>) => {
	const router = useRouter();
	const initials = getInitials(user?.name ?? "Not Available");
	const role = user?.subRole
		? enumToText(user.subRole)
		: user?.role
			? enumToText(user.role)
			: "—";

	return (
		<div className="flex items-center gap-2 px-2 sm:gap-3 sm:px-4 shrink-0">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex cursor-pointer items-center gap-2 focus:outline-none"
					>
						<div className="flex size-8 select-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
							{initials}
						</div>
						<div className="hidden flex-col items-start leading-none sm:flex">
							<span className="text-sm font-semibold">{user?.name ?? "—"}</span>
							<span className="text-xs uppercase tracking-wide text-muted-foreground">
								{role}
							</span>
						</div>
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="flex flex-col gap-0.5">
						<span className="font-semibold">{user?.name ?? "—"}</span>
						<span className="text-xs font-normal text-muted-foreground">
							{user?.email ?? ""}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => router.push(profileLink)}
						className="cursor-pointer"
					>
						<User className="mr-2 h-4 w-4" />
						Profile
					</DropdownMenuItem>

					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={onLogout}
						className="cursor-pointer"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default HeaderUserMenu;
