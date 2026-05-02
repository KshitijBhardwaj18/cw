import { Action, defineAbility } from "@repo/casl";
import type { User } from "@repo/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const Dashboard = async () => {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
		},
	});
	if (!session.data) {
		return redirect("/sign-in");
	}
	const ability = defineAbility(session.data.user as User);
	if (!ability.can(Action.Read, "Dashboard")) {
		return redirect("/organizations");
	}
	return redirect("/dashboard");
};

export default Dashboard;
