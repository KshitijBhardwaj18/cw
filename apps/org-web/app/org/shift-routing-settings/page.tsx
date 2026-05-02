import type { Metadata } from "next";
import { ShiftRoutingSettingsContent } from "@/components/shift-routing/ShiftRoutingSettingsContent";

export const metadata: Metadata = {
	title: "Shift Routing Settings",
	description:
		"Configure how shifts are routed to workforce types and set routing delay between tiers.",
};

export default function ShiftRoutingSettingsPage() {
	return <ShiftRoutingSettingsContent />;
}
