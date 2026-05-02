import { getInitials } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";

interface AvatarGroupProps {
	users: {
		name: string;
		avatar: string;
	}[];
	maxDisplay?: number;
	size?: string;
	stack?: boolean;
}
export const AvatarGroup = ({
	users,
	size = "8",
	stack = true,
	maxDisplay = 5,
}: AvatarGroupProps) => {
	let MAX_DISPLAY_USERS = maxDisplay;
	let remainingUsers = users && Math.max(users.length - MAX_DISPLAY_USERS, 0);
	if (remainingUsers === 1) {
		MAX_DISPLAY_USERS += 1;
	}
	const displayUsers = users ? users.slice(0, MAX_DISPLAY_USERS) : [];
	remainingUsers = users ? Math.max(users.length - MAX_DISPLAY_USERS, 0) : 0;

	return (
		<div className={`flex items-center ${stack ? "-space-x-3" : "space-x-2"}`}>
			{displayUsers.map((user, index) => (
				<div
					key={user.name}
					className={cn(
						"flex aspect-square cursor-pointer items-center justify-center rounded-full border transition-transform hover:scale-110",
						`size-${size} cursor-pointer p-0.25 transition-transform hover:scale-110`,
					)}
					title={user.name}
					style={{
						zIndex: stack ? index : "auto",
						backgroundColor: "white",
					}}
				>
					<Avatar className={`size-full`}>
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
					</Avatar>
					{!stack && index < displayUsers.length - 1 && (
						<span className="h-full">
							<Separator orientation="vertical" />
						</span>
					)}
				</div>
			))}
			{remainingUsers > 0 && (
				<>
					{!stack && (
						<span className="h-full">
							<Separator orientation="vertical" />
						</span>
					)}
					<Avatar
						title={`${remainingUsers} more users`}
						className={`size-${size} border-primary-main bg-muted cursor-pointer border transition-transform hover:scale-110`}
						style={{ zIndex: stack ? displayUsers.length : "auto" }}
					>
						<AvatarFallback>+{remainingUsers}</AvatarFallback>
					</Avatar>
				</>
			)}
		</div>
	);
};
