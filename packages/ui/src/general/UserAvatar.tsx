import { getInitials } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";

interface UserAvatarProps {
	avatarUrl: string;
	name: string;
	className?: string;
	fallbackClassName?: string;
}

const UserAvatar = ({
	avatarUrl,
	name,
	className,
	fallbackClassName,
}: Readonly<UserAvatarProps>) => {
	return (
		<Avatar className={className}>
			<AvatarImage src={avatarUrl} />
			<AvatarFallback className={fallbackClassName}>
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
};

export default UserAvatar;
