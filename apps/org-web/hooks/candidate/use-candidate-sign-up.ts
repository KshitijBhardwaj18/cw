"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOptionalOrgContext } from "@/contexts/org-context";
import { authClient } from "@/lib/auth-client";
import type {
	ContactInformationFormValues,
	CreateAccountFormValues,
	LocationPreferencesFormValues,
	ProfessionalDetailsFormValues,
} from "@/schemas/candidate-sign-up.schema";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";
import { OnboardingService } from "@/services/onboarding.service";

const SIGN_UP_ROUTE = "/candidate/sign-up";
const SELF_STEP_MIN = 0;
const SELF_STEP_MAX = 3;
const INVITE_STEP_MIN = 0;
const INVITE_STEP_MAX = 3;

function buildStepUrl(step: number, isInviteMode: boolean) {
	const params = new URLSearchParams({ step: String(step) });
	if (isInviteMode) params.set("invite", "true");
	return `${SIGN_UP_ROUTE}?${params}`;
}

function applyProgress(
	progress: CandidateMeOnboarding,
	setters: {
		setStep0Values: React.Dispatch<
			React.SetStateAction<Partial<CreateAccountFormValues>>
		>;
		setStep1Values: React.Dispatch<
			React.SetStateAction<Partial<ContactInformationFormValues>>
		>;
		setStep2Values: React.Dispatch<
			React.SetStateAction<Partial<ProfessionalDetailsFormValues>>
		>;
		setStep3Values: React.Dispatch<
			React.SetStateAction<Partial<LocationPreferencesFormValues>>
		>;
		setSelfResumeKey: React.Dispatch<React.SetStateAction<string | null>>;
	},
	isInviteMode: boolean,
) {
	if (isInviteMode && progress.name) {
		const spaceIdx = progress.name.indexOf(" ");
		const firstName =
			spaceIdx === -1 ? progress.name : progress.name.slice(0, spaceIdx);
		const lastName = spaceIdx === -1 ? "" : progress.name.slice(spaceIdx + 1);
		setters.setStep0Values({ firstName, lastName, email: progress.email });
	}
	setters.setStep1Values((prev) => ({
		...prev,
		phone: progress.phoneNumber || prev.phone,
		streetAddress: progress.streetAddress || prev.streetAddress,
		city: progress.city || prev.city,
		state: progress.state || prev.state,
		zipCode: progress.zipCode || prev.zipCode,
	}));
	setters.setStep2Values((prev) => ({
		...prev,
		...(isInviteMode
			? {}
			: { occupationId: progress.occupationId || prev.occupationId }),
		yearsOfExperience:
			progress.yearsOfExperience ?? prev.yearsOfExperience ?? 0,
		specialtyIds: progress.specialtyIds.length
			? progress.specialtyIds
			: (prev.specialtyIds ?? []),
		preferredContractLengths:
			progress.preferredContractLengths ?? prev.preferredContractLengths ?? [],
	}));
	setters.setSelfResumeKey(progress.resumeUrl);
	setters.setStep3Values((prev) => ({
		...prev,
		locationIds: progress.locationIds.length
			? progress.locationIds
			: (prev.locationIds ?? []),
	}));
}

export function useCandidateSignUp() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const org = useOptionalOrgContext();

	const isInviteMode = searchParams.get("invite") === "true";
	const rawStep = Number(searchParams.get("step")) || 0;

	const step = useMemo(() => {
		return isInviteMode
			? Math.min(
					INVITE_STEP_MAX,
					Math.max(INVITE_STEP_MIN, rawStep || INVITE_STEP_MIN),
				)
			: Math.min(SELF_STEP_MAX, Math.max(SELF_STEP_MIN, rawStep));
	}, [isInviteMode, rawStep]);

	// For invite: meData is populated from getMeOnboarding after session cookie is set by magic link.
	// For self: populated after OTP verification pushes to step >= 1.
	const [meData, setMeData] = useState<CandidateMeOnboarding | null>(null);
	const [meLoading, setMeLoading] = useState(isInviteMode);
	const [meError, setMeError] = useState<string | null>(null);

	const [step0Values, setStep0Values] = useState<
		Partial<CreateAccountFormValues>
	>({});
	const [step1Values, setStep1Values] = useState<
		Partial<ContactInformationFormValues>
	>({});
	const [step2Values, setStep2Values] = useState<
		Partial<ProfessionalDetailsFormValues>
	>({});
	const [step3Values, setStep3Values] = useState<
		Partial<LocationPreferencesFormValues>
	>({});

	const [selfResumeKey, setSelfResumeKey] = useState<string | null>(null);
	const [selfOtpEmail, setSelfOtpEmail] = useState<string>("");
	const [selfOtpSent, setSelfOtpSent] = useState(false);

	const pushStep = useCallback(
		(s: number) => router.push(buildStepUrl(s, isInviteMode)),
		[router, isInviteMode],
	);

	// Prefill effect:
	// - Invite: runs immediately on mount (session cookie was set by magic link before redirect)
	// - Self: runs once step >= 1 (OTP verified)
	useEffect(() => {
		const shouldPrefill = isInviteMode ? true : step >= 1;
		if (!shouldPrefill) return;

		void (async () => {
			try {
				setMeLoading(true);
				const progress = await OnboardingService.getMeOnboarding();
				setMeData(progress);
				applyProgress(
					progress,
					{
						setStep0Values,
						setStep1Values,
						setStep2Values,
						setStep3Values,
						setSelfResumeKey,
					},
					isInviteMode,
				);
				setMeError(null);
			} catch (err) {
				if (isInviteMode) {
					setMeError(
						err instanceof Error
							? err.message
							: "Unable to load invite details",
					);
				}
				// Self mode: ignore — session may not exist yet
			} finally {
				setMeLoading(false);
			}
		})();
	}, [isInviteMode, step]);

	const handleStep0Continue = useCallback(
		(values: CreateAccountFormValues) => {
			setStep0Values(values);

			const orgId = org?.id;
			if (!orgId) {
				toast.error("Organization is required");
				return;
			}

			void (async () => {
				try {
					await OnboardingService.startSelfOnboarding({
						organizationId: orgId,
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
					});

					const { error } = await authClient.emailOtp.sendVerificationOtp({
						email: values.email,
						type: "sign-in",
						fetchOptions: {
							body: {
								email: values.email,
								type: "sign-in",
								portal: "candidate",
								organizationId: orgId,
							},
						},
					});
					if (error) {
						throw new Error(error.message ?? "Failed to send OTP");
					}
					setSelfOtpEmail(values.email);
					setSelfOtpSent(true);
				} catch (err) {
					toast.error(
						err instanceof Error ? err.message : "Failed to send OTP",
					);
				}
			})();
		},
		[org?.id],
	);

	const requestResumeSignedUrl = useCallback(async () => {
		const res = await OnboardingService.getMeResumeSignedUrl();
		return res.signedUrl;
	}, []);

	// ── Self-onboarding step handlers ──────────────────────────────────────────

	const handleStep1Back = useCallback(() => pushStep(0), [pushStep]);

	const handleStep1Continue = useCallback(
		async (values: ContactInformationFormValues) => {
			setStep1Values(values);
			try {
				await OnboardingService.saveMeOnboarding({
					phoneNumber: values.phone,
					streetAddress: values.streetAddress,
					city: values.city,
					state: values.state,
					zipCode: values.zipCode,
				});
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save contact info",
				);
				return;
			}
			pushStep(2);
		},
		[pushStep],
	);

	const handleStep2Back = useCallback(() => pushStep(1), [pushStep]);

	const handleStep2Continue = useCallback(
		async (values: ProfessionalDetailsFormValues) => {
			setStep2Values(values);
			try {
				if (!values.resumeFile && !selfResumeKey) {
					toast.error("Resume / CV is required");
					return;
				}

				await OnboardingService.saveMeOnboarding({
					occupationId: values.occupationId,
					yearsOfExperience: values.yearsOfExperience,
					specialtyIds: values.specialtyIds,
					preferredContractLengths: values.preferredContractLengths,
				});

				if (values.resumeFile) {
					const res = await OnboardingService.saveMeResume(values.resumeFile);
					setSelfResumeKey(res.resumeUrl);
				}
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to save professional details",
				);
				return;
			}
			pushStep(3);
		},
		[pushStep, selfResumeKey],
	);

	const handleStep3Back = useCallback(() => pushStep(2), [pushStep]);

	const handleStep3Submit = useCallback(
		async (values: LocationPreferencesFormValues) => {
			setStep3Values(values);
			try {
				await OnboardingService.saveMeOnboarding({
					locationIds: values.locationIds,
				});
				toast.success("Onboarding completed");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save locations",
				);
				return;
			}
			router.push("/sign-in");
		},
		[router],
	);

	// ── Invite-onboarding step handlers (session-based, same me/* endpoints) ──

	/** Step 0 in invite mode: save any name edits then advance. */
	const handleInviteStep0Continue = useCallback(
		(values: CreateAccountFormValues) => {
			setStep0Values(values);
			pushStep(1);
		},
		[pushStep],
	);

	const handleInviteContactContinue = useCallback(
		async (values: ContactInformationFormValues) => {
			setStep1Values(values);
			try {
				await OnboardingService.saveMeOnboarding({
					phoneNumber: values.phone,
					streetAddress: values.streetAddress,
					city: values.city,
					state: values.state,
					zipCode: values.zipCode,
				});
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to save contact info",
				);
				return;
			}
			pushStep(2);
		},
		[pushStep],
	);

	const handleInviteProfessionalContinue = useCallback(
		async (values: ProfessionalDetailsFormValues) => {
			setStep2Values(values);
			try {
				if (!values.resumeFile && !selfResumeKey) {
					toast.error("Resume / CV is required");
					return;
				}
				await OnboardingService.saveMeOnboarding({
					yearsOfExperience: values.yearsOfExperience,
					specialtyIds: values.specialtyIds,
					preferredContractLengths: values.preferredContractLengths,
				});

				if (values.resumeFile) {
					const res = await OnboardingService.saveMeResume(values.resumeFile);
					setSelfResumeKey(res.resumeUrl);
				}
			} catch (err) {
				toast.error(
					err instanceof Error
						? err.message
						: "Failed to save professional details",
				);
				return;
			}
			pushStep(3);
		},
		[pushStep, selfResumeKey],
	);

	const handleInviteLocationSubmit = useCallback(
		async (values: LocationPreferencesFormValues) => {
			setStep3Values(values);
			try {
				await OnboardingService.completeMeInvite(
					values.locationIds?.length ? values.locationIds : undefined,
				);
				toast.success("Profile completed. You can now sign in.");
				router.push("/sign-in");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to complete profile",
				);
			}
		},
		[router],
	);

	// ── OTP helpers (self only) ────────────────────────────────────────────────

	const handleVerifySelfOtp = useCallback(
		async (email: string, otp: string) => {
			const orgId = org?.id;
			if (!orgId) {
				throw new Error("Organization is required");
			}

			const { error } = await authClient.signIn.emailOtp({
				email,
				otp,
				fetchOptions: {
					body: {
						email,
						otp,
						portal: "candidate",
						organizationId: orgId,
					},
				},
			});
			if (error) {
				throw new Error(error.message ?? "Invalid OTP");
			}

			const progress = await OnboardingService.getMeOnboarding();
			setMeData(progress);
			applyProgress(
				progress,
				{
					setStep0Values,
					setStep1Values,
					setStep2Values,
					setStep3Values,
					setSelfResumeKey,
				},
				false,
			);
			setSelfOtpSent(false);
			setSelfOtpEmail("");
			pushStep(1);
			return true;
		},
		[org?.id, pushStep],
	);

	const handleBackToEmail = useCallback(() => {
		setSelfOtpSent(false);
		setSelfOtpEmail("");
	}, []);

	const handleResendSelfOtp = useCallback(
		async (email: string) => {
			const orgId = org?.id;
			if (!orgId) {
				throw new Error("Organization is required");
			}

			const { error } = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
				fetchOptions: {
					body: {
						email,
						type: "sign-in",
						portal: "candidate",
						organizationId: orgId,
					},
				},
			});

			if (error) {
				throw new Error(error.message ?? "Failed to resend OTP");
			}
			return true;
		},
		[org?.id],
	);

	return {
		orgId: org?.id,
		isInviteMode,
		step,
		meData,
		meLoading,
		meError,
		step0Values,
		step1Values,
		step2Values,
		step3Values,
		setStep0Values,
		setStep1Values,
		setStep2Values,
		setStep3Values,
		selfOtpEmail,
		selfOtpSent,
		selfResumeKey,
		handleStep0Continue,
		handleStep1Back,
		handleStep1Continue,
		handleStep2Back,
		handleStep2Continue,
		handleStep3Back,
		handleStep3Submit,
		handleInviteStep0Continue,
		handleInviteContactContinue,
		handleInviteProfessionalContinue,
		handleInviteLocationSubmit,
		handleVerifySelfOtp,
		handleBackToEmail,
		handleResendSelfOtp,
		requestResumeSignedUrl,
		pushStep,
	};
}
