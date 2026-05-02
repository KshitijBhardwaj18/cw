"use client";

import type { ProfileUser } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Mail, MapPin, Phone, UserIcon } from "lucide-react";
import { formatPhoneNumber } from "react-phone-number-input";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";

export type ProfileCardProps = {
	user: ProfileUser;
	profile: CandidateMeOnboarding | null;
	editProfileSlot: React.ReactNode;
};

function buildLocationString(profile: CandidateMeOnboarding | null): string {
	if (!profile) return "";
	const parts = [profile.city, profile.state, profile.zipCode].filter(Boolean);
	return parts.join(", ");
}

export function ProfileCard({
	user,
	profile,
	editProfileSlot,
}: ProfileCardProps) {
	const location = buildLocationString(profile);

	return (
		<Card className="w-full">
			<CardHeader className="flex items-center justify-between">
				<span className="flex flex-col gap-1">
					<CardTitle className="text-xl">Personal Information</CardTitle>
					<CardDescription>
						Manage your personal information here
					</CardDescription>
				</span>
				{editProfileSlot}
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4">
				<DetailItem icon={UserIcon} label="Full Name" value={user.name} />
				<DetailItem
					icon={Mail}
					label="Email Address"
					value={user.email}
					readOnly
				/>
				<DetailItem
					icon={Phone}
					label="Phone Number"
					value={
						formatPhoneNumber(user.phoneNumber ?? "") || user.phoneNumber || "—"
					}
				/>
				<DetailItem icon={MapPin} label="Location" value={location || "—"} />
			</CardContent>
		</Card>
	);
}
