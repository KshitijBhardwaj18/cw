"use client";

import type { ProfileUser } from "@repo/shared";
import { enumToText, getLabel, TIMEZONE_OPTIONS } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Building2, Globe, Mail, Phone, Shield, UserIcon } from "lucide-react";
import { formatPhoneNumber } from "react-phone-number-input";
import { ProfileField } from "./ProfileField";

export type ProfileCardProps = {
	user: ProfileUser;
	editProfileSlot: React.ReactNode;
	signOutSlot: React.ReactNode;
};

export function ProfileCard({
	user,
	editProfileSlot,
	signOutSlot,
}: Readonly<ProfileCardProps>) {
	const role = user?.subRole
		? enumToText(user.subRole)
		: user?.role
			? enumToText(user.role)
			: "—";
	return (
		<Card className="w-full">
			<CardHeader className="flex items-center justify-between">
				<span className="flex flex-col gap-1">
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Manage your profile information here
					</CardDescription>
				</span>
				{editProfileSlot}
			</CardHeader>
			<CardContent className="space-y-4">
				<ProfileField icon={UserIcon} label="Full Name" value={user.name} />
				<ProfileField
					icon={Mail}
					label="Email Address"
					value={user.email}
					readonly
				/>
				<ProfileField icon={Shield} label="Role" value={role} readonly />
				<ProfileField
					icon={Phone}
					label="Phone Number"
					value={formatPhoneNumber(user.phoneNumber ?? "")}
				/>
				<ProfileField
					icon={Building2}
					label="Office Phone"
					value={formatPhoneNumber(user.officePhone ?? "")}
				/>
				<ProfileField
					icon={Globe}
					label="Time Zone"
					value={getLabel(TIMEZONE_OPTIONS, user.timeZone ?? "")}
				/>
				{signOutSlot}
			</CardContent>
		</Card>
	);
}
