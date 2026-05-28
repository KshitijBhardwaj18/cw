"use client";

import type { ProfileUser } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { ProfileCard } from "@repo/ui/general/ProfileCard";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActiveSessionsCard } from "./ActiveSessionsCard";
import { EditProfileDialog } from "./EditProfileDialog";
import { SignOutButton } from "./SignOutButton";

type ProfileSectionProps = {
	user: ProfileUser;
	currentSessionToken: string | undefined;
};

export function ProfileSection({
	user,
	currentSessionToken,
}: Readonly<ProfileSectionProps>) {
	const router = useRouter();

	return (
		<>
			<ProfileCard
				user={user}
				editProfileSlot={
					<EditProfileDialog
						user={user}
						onSuccess={() => router.refresh()}
						trigger={
							<Button variant="default" size="sm">
								<PencilIcon className="h-4 w-4" />
								Edit Profile
							</Button>
						}
					/>
				}
				signOutSlot={<SignOutButton />}
			/>
			<ActiveSessionsCard currentSessionToken={currentSessionToken} />
		</>
	);
}
