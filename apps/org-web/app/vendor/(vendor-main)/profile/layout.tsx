import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Member" }]}
		>
			<div className="flex flex-1 items-center justify-center font-sans">
				<main className="bg-background flex w-full max-w-3xl flex-col items-center justify-center p-16 sm:items-start">
					<div className="flex w-full flex-col gap-6">{children}</div>
				</main>
			</div>
		</PermissionsGuard>
	);
};

export default ProfileLayout;
