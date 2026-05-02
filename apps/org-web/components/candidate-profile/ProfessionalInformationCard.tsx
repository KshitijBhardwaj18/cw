"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Briefcase, Clock, Luggage, MapPin, Stethoscope } from "lucide-react";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";

export type ProfessionalInformationCardProps = {
	profile: CandidateMeOnboarding | null;
	editProfessionalSlot: React.ReactNode;
};

export function ProfessionalInformationCard({
	profile,
	editProfessionalSlot,
}: ProfessionalInformationCardProps) {
	const specialties = profile?.specialties ?? [];
	const locations = profile?.locations ?? [];
	const preferredShiftTypes = profile?.preferredShiftTypes ?? [];

	return (
		<Card className="w-full">
			<CardHeader className="flex items-center justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-xl">Professional Information</CardTitle>
					<CardDescription>
						Review and update your skills and preferences.
					</CardDescription>
				</div>
				{editProfessionalSlot}
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-4">
				<div className="space-y-4">
					<DetailItem
						icon={Stethoscope}
						label="Occupation"
						value={profile?.occupationName || "—"}
					/>

					{specialties.length > 0 && (
						<DetailItem
							icon={Stethoscope}
							label="Specialties"
							value={
								<div className="flex flex-wrap gap-2">
									{specialties.map((s) => (
										<Badge key={s.id} variant="info">
											{s.name}
										</Badge>
									))}
								</div>
							}
						/>
					)}

					<DetailItem
						icon={Luggage}
						label="Willing to Relocate"
						value={
							profile === null ? "—" : profile.willingToRelocate ? "Yes" : "No"
						}
					/>
				</div>

				<div className="space-y-4">
					<DetailItem
						icon={Briefcase}
						label="Experience"
						value={
							profile?.yearsOfExperience != null
								? `${profile.yearsOfExperience} year${profile.yearsOfExperience === 1 ? "" : "s"}`
								: "—"
						}
					/>

					{preferredShiftTypes.length > 0 && (
						<DetailItem
							icon={Clock}
							label="Preferred Shift Types"
							value={
								<div className="flex flex-wrap gap-2">
									{preferredShiftTypes.map((shift) => (
										<Badge key={shift} variant="info">
											{shift}
										</Badge>
									))}
								</div>
							}
						/>
					)}

					{locations.length > 0 && (
						<DetailItem
							icon={MapPin}
							label="Preferred Locations"
							value={
								<div className="flex flex-wrap gap-2">
									{locations.map((loc) => (
										<Badge key={loc.id} variant="info">
											{[loc.city, loc.state].filter(Boolean).join(", ") ||
												loc.name}
										</Badge>
									))}
								</div>
							}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
