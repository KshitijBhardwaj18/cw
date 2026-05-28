"use client";
import { AbilityProvider, type AppAbility, defineAbility } from "@repo/casl";
import type { User } from "@repo/db";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { type AuthSession, authClient, useSession } from "@/lib/auth-client";

export type AuthContextType = {
	session: AuthSession;
	ability: AppAbility;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
	const { data: session, isPending: isSessionPending, error } = useSession();
	const router = useRouter();

	const ability = useMemo(() => {
		if (!session) return null;
		return defineAbility(session.user as User);
	}, [session]);

	useEffect(() => {
		if (!isSessionPending && !session && error) {
			toast.error(error?.message ?? "Session expired. Please sign in again.");
			authClient
				.signOut()
				.then((data) => {
					if (!data.data?.success) {
						toast.error(data.error?.message || "Failed to sign out");
					}
					router.push("/sign-in");
				})
				.catch((err) => {
					toast.error(err.message || "Failed to sign out");
				});
		}
	}, [isSessionPending, session, error, router]);

	if (isSessionPending || !ability || !session) {
		return (
			<div className="flex h-dvh items-center justify-center">
				<LoadingScreen />
			</div>
		);
	}

	return (
		<AuthContext.Provider value={{ session, ability }}>
			<AbilityProvider value={ability}>{children}</AbilityProvider>
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
