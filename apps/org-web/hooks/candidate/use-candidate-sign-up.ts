"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	candidateProfileKeys,
	useCompleteMeInvite,
	useSaveMeIdentity,
	useSaveMeQuestionnaireAnswers,
	useSaveMeReferences,
	useSaveMeSkillsChecklist,
	useStartSelfOnboarding,
	useUpdateCandidateProfile,
	useUploadResume,
} from "@/queries/candidate-profile.queries";
import type {
	ContactInformationFormValues,
	CreateAccountFormValues,
	LocationPreferencesFormValues,
	PreferencesQuestionnairesFormValues,
	ProfessionalDetailsFormValues,
	SubmissionReadinessFormValues,
} from "@/schemas/candidate-sign-up.schema";
import type {
	CandidateMeOnboarding,
	CandidateOnboardingQuestionnaires,
} from "@/services/onboarding.service";
import { OnboardingService } from "@/services/onboarding.service";

const SIGN_UP_ROUTE = "/candidate/sign-up";
const SELF_STEP_MIN = 0;
const SELF_STEP_MAX = 5;
const INVITE_STEP_MIN = 0;
const INVITE_STEP_MAX = 5;

function buildStepUrl(step: number, isInviteMode: boolean) {
	const params = new URLSearchParams({ step: String(step) });
	if (isInviteMode) params.set("invite", "true");
	return `${SIGN_UP_ROUTE}?${params}`;
}

function nextIncompleteSelfStep(progress: CandidateMeOnboarding): number {
	const hasContact =
		!!progress.streetAddress &&
		!!progress.city &&
		!!progress.state &&
		!!progress.zipCode;
	if (!hasContact) return 1;

	const hasProfessional =
		!!progress.occupationId &&
		progress.specialtyIds.length > 0 &&
		!!progress.resumeUrl;
	if (!hasProfessional) return 2;

	if (progress.locationIds.length === 0) return 3;

	const hasPreferences =
		progress.preferredShiftTypes.length > 0 &&
		progress.preferredContractLengths.length > 0 &&
		!!progress.totalProfessionalExperienceBand;
	if (!hasPreferences) return 4;

	const hasSubmissionReadiness =
		!!progress.dateOfBirth &&
		!!progress.lastFourSsn &&
		!!progress.skillsChecklistFileKey &&
		progress.professionalReferences.length >= 2;
	if (!hasSubmissionReadiness) return 5;

	if (!progress.onboardingCompletedAt) return 5;
	return 5;
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
		setStep4Values: React.Dispatch<
			React.SetStateAction<Partial<PreferencesQuestionnairesFormValues>>
		>;
		setStep5Values: React.Dispatch<
			React.SetStateAction<Partial<SubmissionReadinessFormValues>>
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
		specialtyIds: progress.specialtyIds.length
			? progress.specialtyIds
			: (prev.specialtyIds ?? []),
	}));
	setters.setSelfResumeKey(progress.resumeUrl);
	setters.setStep3Values((prev) => ({
		...prev,
		locationIds: progress.locationIds.length
			? progress.locationIds
			: (prev.locationIds ?? []),
	}));
	setters.setStep4Values((prev) => ({
		...prev,
		preferredContractLengths: progress.preferredContractLengths?.length
			? progress.preferredContractLengths
			: (prev.preferredContractLengths ?? []),
		preferredShiftTypes: (progress.preferredShiftTypes?.length
			? progress.preferredShiftTypes
			: (prev.preferredShiftTypes ??
				[])) as PreferencesQuestionnairesFormValues["preferredShiftTypes"],
		earliestStartDate:
			progress.earliestStartDate ?? prev.earliestStartDate ?? "",
		recentJobTitle: progress.recentJobTitle ?? prev.recentJobTitle ?? "",
		totalProfessionalExperienceBand:
			progress.totalProfessionalExperienceBand ??
			prev.totalProfessionalExperienceBand,
	}));
	setters.setStep5Values((prev) => ({
		...prev,
		dateOfBirth: progress.dateOfBirth ?? prev.dateOfBirth ?? "",
		lastFourSsn: progress.lastFourSsn ?? prev.lastFourSsn ?? "",
		skillsChecklistFileKey:
			progress.skillsChecklistFileKey ?? prev.skillsChecklistFileKey ?? null,
		skillsChecklistFile: prev.skillsChecklistFile ?? null,
		references:
			progress.professionalReferences.length > 0
				? progress.professionalReferences.map((r) => ({
						fullName: r.fullName,
						title: r.title,
						organization: r.organization,
						relationship: r.relationship,
						phone: r.phone,
						email: r.email,
					}))
				: (prev.references ?? []),
	}));
}

export function useCandidateSignUp() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	const startSelfOnboardingMutation = useStartSelfOnboarding();
	const saveOnboardingMutation = useUpdateCandidateProfile();
	const uploadResumeMutation = useUploadResume();
	const saveQuestionnaireAnswersMutation = useSaveMeQuestionnaireAnswers();
	const saveIdentityMutation = useSaveMeIdentity();
	const saveReferencesMutation = useSaveMeReferences();
	const saveSkillsChecklistMutation = useSaveMeSkillsChecklist();
	const completeMeInviteMutation = useCompleteMeInvite();

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
	const [step4Values, setStep4Values] = useState<
		Partial<PreferencesQuestionnairesFormValues>
	>({});
	const [step5Values, setStep5Values] = useState<
		Partial<SubmissionReadinessFormValues>
	>({});

	const [inviteFinalizePending, setInviteFinalizePending] = useState(false);
	const [selfFinalizePending, setSelfFinalizePending] = useState(false);
	const [selfResumeKey, setSelfResumeKey] = useState<string | null>(null);
	const [selfOtpEmail, setSelfOtpEmail] = useState<string>("");
	const [selfOtpSent, setSelfOtpSent] = useState(false);

	const [questionnaires, setQuestionnaires] =
		useState<CandidateOnboardingQuestionnaires | null>(null);
	const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
		Record<string, string>
	>({});
	const [questionnairesLoading, setQuestionnairesLoading] = useState(false);
	const [savingScopeId, setSavingScopeId] = useState<string | null>(null);

	const pushStep = useCallback(
		(s: number) => router.push(buildStepUrl(s, isInviteMode)),
		[router, isInviteMode],
	);

	const revokeCandidateSignUpSession =
		useCallback(async (): Promise<boolean> => {
			const { error } = await authClient.signOut();
			if (error) {
				toast.error(error.message ?? "Something went wrong");
				return false;
			}
			queryClient.removeQueries({ queryKey: ["candidates", "me"] });
			return true;
		}, [queryClient]);

	const handleLogout = useCallback(async () => {
		if (!(await revokeCandidateSignUpSession())) return;
		router.refresh();
		router.push("/sign-in");
	}, [revokeCandidateSignUpSession, router]);

	const handleStep1Back = useCallback(async () => {
		if (!(await revokeCandidateSignUpSession())) return;
		setMeData(null);
		setSelfOtpSent(false);
		setSelfOtpEmail("");
		setSelfResumeKey(null);
		router.refresh();
		pushStep(0);
	}, [pushStep, revokeCandidateSignUpSession, router]);

	useEffect(() => {
		void (async () => {
			try {
				setMeLoading(true);
				const progress = await queryClient.fetchQuery({
					queryKey: candidateProfileKeys.me,
					queryFn: () => OnboardingService.getMeOnboarding(),
				});

				if (isInviteMode && progress.inviteStatus === "ACCEPTED") {
					toast.info(
						"You have already completed your profile. Please sign in.",
					);
					router.replace("/sign-in");
					return;
				}

				setMeData(progress);
				applyProgress(
					progress,
					{
						setStep0Values,
						setStep1Values,
						setStep2Values,
						setStep3Values,
						setStep4Values,
						setStep5Values,
						setSelfResumeKey,
					},
					isInviteMode,
				);
				setMeError(null);

				if (!isInviteMode && step === 0 && !selfOtpSent) {
					const target = nextIncompleteSelfStep(progress);
					if (target !== step) {
						router.replace(buildStepUrl(target, false));
					}
				}
			} catch (err) {
				if (isInviteMode) {
					setMeError(
						err instanceof Error
							? err.message
							: "Unable to load invite details",
					);
				}
				// Self mode: ignore — session may not exist yet (show Create Account)
			} finally {
				setMeLoading(false);
			}
		})();
	}, [isInviteMode, step, router.replace, selfOtpSent, queryClient]);

	const handleStep0Continue = useCallback(
		(values: CreateAccountFormValues) => {
			setStep0Values(values);

			startSelfOnboardingMutation.mutate(
				{
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
				},
				{
					onSuccess: () => {
						void (async () => {
							const { error } = await authClient.emailOtp.sendVerificationOtp({
								email: values.email,
								type: "sign-in",
								fetchOptions: {
									body: {
										email: values.email,
										type: "sign-in",
										portal: "candidate",
									},
								},
							});
							if (error) {
								toast.error(error.message ?? "Failed to send OTP");
								return;
							}
							setSelfOtpEmail(values.email);
							setSelfOtpSent(true);
						})();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Failed to send OTP",
						);
					},
				},
			);
		},
		[startSelfOnboardingMutation],
	);

	const requestResumeSignedUrl = useCallback(async () => {
		const res = await queryClient.fetchQuery({
			queryKey: candidateProfileKeys.resumeSignedUrl,
			queryFn: () => OnboardingService.getMeResumeSignedUrl(),
			staleTime: 50_000,
		});
		return res.signedUrl;
	}, [queryClient]);

	// ── Self-onboarding step handlers ──────────────────────────────────────────

	const handleStep1Continue = useCallback(
		(values: ContactInformationFormValues) => {
			setStep1Values(values);
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{
						phoneNumber: values.phone,
						streetAddress: values.streetAddress,
						city: values.city,
						state: values.state,
						zipCode: values.zipCode,
					},
					{
						onSuccess: () => {
							pushStep(2);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to save contact info",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, saveOnboardingMutation],
	);

	const handleStep2Back = useCallback(() => pushStep(1), [pushStep]);

	const handleStep2Continue = useCallback(
		(values: ProfessionalDetailsFormValues) => {
			setStep2Values(values);
			if (!values.resumeFile && !selfResumeKey) {
				toast.error("Resume / CV is required");
				return Promise.resolve();
			}
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{
						occupationId: values.occupationId,
						specialtyIds: values.specialtyIds,
					},
					{
						onSuccess: () => {
							if (!values.resumeFile) {
								pushStep(3);
								resolve();
								return;
							}
							uploadResumeMutation.mutate(values.resumeFile, {
								onSuccess: (res) => {
									setSelfResumeKey(res.resumeUrl);
									pushStep(3);
									resolve();
								},
								onError: (err) => {
									toast.error(
										err instanceof Error
											? err.message
											: "Failed to upload resume",
									);
									reject(err);
								},
							});
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to save professional details",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, selfResumeKey, saveOnboardingMutation, uploadResumeMutation],
	);

	const handleStep3Back = useCallback(() => pushStep(2), [pushStep]);

	const handleStep3Submit = useCallback(
		(values: LocationPreferencesFormValues) => {
			setStep3Values(values);
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{ locationIds: values.locationIds },
					{
						onSuccess: () => {
							pushStep(4);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to save locations",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, saveOnboardingMutation],
	);

	const handlePreferencesStepBack = useCallback(() => pushStep(3), [pushStep]);

	const reloadQuestionnaires =
		useCallback(async (): Promise<CandidateOnboardingQuestionnaires | null> => {
			setQuestionnairesLoading(true);
			try {
				const data = await queryClient.fetchQuery({
					queryKey: candidateProfileKeys.questionnaires,
					queryFn: () => OnboardingService.getMeQuestionnaires(),
				});
				setQuestionnaires(data);
				setQuestionnaireAnswers(data.answers);
				return data;
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to load questionnaires",
				);
				return null;
			} finally {
				setQuestionnairesLoading(false);
			}
		}, [queryClient]);

	useEffect(() => {
		if (step !== 4) return;
		if (!meData?.occupationId) return;
		void reloadQuestionnaires();
	}, [step, meData?.occupationId, reloadQuestionnaires]);

	const handleSaveScopeAnswers = useCallback(
		(
			_kind: "occupation" | "specialty",
			scopeId: string,
			next: Record<string, string>,
		) => {
			setSavingScopeId(scopeId);
			const payload = Object.entries(next).map(([questionId, value]) => ({
				questionId,
				value,
			}));
			return new Promise<void>((resolve, reject) => {
				saveQuestionnaireAnswersMutation.mutate(
					{ answers: payload },
					{
						onSuccess: () => {
							setQuestionnaireAnswers((prev) => ({ ...prev, ...next }));
							setSavingScopeId(null);
							resolve();
						},
						onError: (err) => {
							setSavingScopeId(null);
							toast.error(
								err instanceof Error ? err.message : "Failed to save answers",
							);
							reject(err);
						},
					},
				);
			});
		},
		[saveQuestionnaireAnswersMutation],
	);

	const handlePreferencesStepContinue = useCallback(
		(values: PreferencesQuestionnairesFormValues) => {
			setStep4Values(values);
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{
						preferredShiftTypes: values.preferredShiftTypes,
						preferredContractLengths: values.preferredContractLengths,
						...(values.totalProfessionalExperienceBand
							? {
									totalProfessionalExperienceBand:
										values.totalProfessionalExperienceBand,
								}
							: {}),
						...(values.earliestStartDate
							? { earliestStartDate: values.earliestStartDate }
							: {}),
						...(values.recentJobTitle
							? { recentJobTitle: values.recentJobTitle }
							: {}),
					},
					{
						onSuccess: () => {
							pushStep(5);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to save preferences",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, saveOnboardingMutation],
	);

	const handleSubmissionReadinessBack = useCallback(
		() => pushStep(4),
		[pushStep],
	);

	const persistStep5 = useCallback(
		(values: SubmissionReadinessFormValues) => {
			return new Promise<void>((resolve, reject) => {
				const onIdentityError = (err: unknown) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to save identity",
					);
					reject(err);
				};
				const onReferencesError = (err: unknown) => {
					toast.error(
						err instanceof Error ? err.message : "Failed to save references",
					);
					reject(err);
				};
				const onChecklistError = (err: unknown) => {
					toast.error(
						err instanceof Error
							? err.message
							: "Failed to upload skills checklist",
					);
					reject(err);
				};

				const uploadChecklistThenResolve = () => {
					if (!values.skillsChecklistFile) {
						resolve();
						return;
					}
					saveSkillsChecklistMutation.mutate(values.skillsChecklistFile, {
						onSuccess: (res) => {
							setStep5Values((prev) => ({
								...prev,
								skillsChecklistFileKey: res.skillsChecklistFileKey,
								skillsChecklistFile: null,
							}));
							resolve();
						},
						onError: onChecklistError,
					});
				};

				const saveReferencesThenChecklist = () => {
					if (values.references.length === 0) {
						uploadChecklistThenResolve();
						return;
					}
					saveReferencesMutation.mutate(
						values.references.map((r) => ({
							fullName: r.fullName,
							title: r.title,
							organization: r.organization,
							relationship: r.relationship,
							phone: r.phone,
							email: r.email,
						})),
						{
							onSuccess: () => uploadChecklistThenResolve(),
							onError: onReferencesError,
						},
					);
				};

				saveIdentityMutation.mutate(
					{
						dateOfBirth: values.dateOfBirth,
						lastFourSsn: values.lastFourSsn,
					},
					{
						onSuccess: () => saveReferencesThenChecklist(),
						onError: onIdentityError,
					},
				);
			});
		},
		[saveIdentityMutation, saveReferencesMutation, saveSkillsChecklistMutation],
	);

	const handleSelfSubmissionFinalize = useCallback(
		async (values: SubmissionReadinessFormValues) => {
			setSelfFinalizePending(true);
			try {
				await persistStep5(values);
			} catch {
				setSelfFinalizePending(false);
				return;
			}
			const ids = step3Values.locationIds;
			completeMeInviteMutation.mutate(
				ids !== undefined && ids.length > 0 ? ids : undefined,
				{
					onSuccess: () => {
						setSelfFinalizePending(false);
						toast.success("Onboarding completed");
						router.push("/dashboard");
					},
					onError: (err) => {
						setSelfFinalizePending(false);
						toast.error(
							err instanceof Error
								? err.message
								: "Failed to complete onboarding",
						);
					},
				},
			);
		},
		[persistStep5, router, step3Values.locationIds, completeMeInviteMutation],
	);

	const handleInviteSubmissionFinalize = useCallback(
		async (values: SubmissionReadinessFormValues) => {
			setInviteFinalizePending(true);
			try {
				await persistStep5(values);
			} catch {
				setInviteFinalizePending(false);
				return;
			}
			const ids = step3Values.locationIds;
			completeMeInviteMutation.mutate(
				ids !== undefined && ids.length > 0 ? ids : undefined,
				{
					onSuccess: () => {
						setInviteFinalizePending(false);
						toast.success("Profile completed. Taking you to the dashboard...");
						router.push("/dashboard");
					},
					onError: (err) => {
						setInviteFinalizePending(false);
						toast.error(
							err instanceof Error ? err.message : "Failed to complete profile",
						);
					},
				},
			);
		},
		[persistStep5, router, step3Values.locationIds, completeMeInviteMutation],
	);

	/** Step 0 in invite mode: save any name edits then advance. */
	const handleInviteStep0Continue = useCallback(
		(values: CreateAccountFormValues) => {
			setStep0Values(values);
			pushStep(1);
		},
		[pushStep],
	);

	const handleInviteContactContinue = useCallback(
		(values: ContactInformationFormValues) => {
			setStep1Values(values);
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{
						phoneNumber: values.phone,
						streetAddress: values.streetAddress,
						city: values.city,
						state: values.state,
						zipCode: values.zipCode,
					},
					{
						onSuccess: () => {
							pushStep(2);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to save contact info",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, saveOnboardingMutation],
	);

	const handleInviteProfessionalContinue = useCallback(
		(values: ProfessionalDetailsFormValues) => {
			setStep2Values(values);
			if (!values.resumeFile && !selfResumeKey) {
				toast.error("Resume / CV is required");
				return Promise.resolve();
			}
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{ specialtyIds: values.specialtyIds },
					{
						onSuccess: () => {
							if (!values.resumeFile) {
								pushStep(3);
								resolve();
								return;
							}
							uploadResumeMutation.mutate(values.resumeFile, {
								onSuccess: (res) => {
									setSelfResumeKey(res.resumeUrl);
									pushStep(3);
									resolve();
								},
								onError: (err) => {
									toast.error(
										err instanceof Error
											? err.message
											: "Failed to upload resume",
									);
									reject(err);
								},
							});
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to save professional details",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, selfResumeKey, saveOnboardingMutation, uploadResumeMutation],
	);

	const handleInviteLocationSubmit = useCallback(
		(values: LocationPreferencesFormValues) => {
			setStep3Values(values);
			return new Promise<void>((resolve, reject) => {
				saveOnboardingMutation.mutate(
					{ locationIds: values.locationIds },
					{
						onSuccess: () => {
							pushStep(4);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to save locations",
							);
							reject(err);
						},
					},
				);
			});
		},
		[pushStep, saveOnboardingMutation],
	);

	// ── OTP helpers (self only) ────────────────────────────────────────────────

	const handleVerifySelfOtp = useCallback(
		async (email: string, otp: string) => {
			const { error } = await authClient.signIn.emailOtp({
				email,
				otp,
				fetchOptions: {
					body: {
						email,
						otp,
						portal: "candidate",
					},
				},
			});
			if (error) {
				throw new Error(error.message ?? "Invalid OTP");
			}

			const progress = await queryClient.fetchQuery({
				queryKey: candidateProfileKeys.me,
				queryFn: () => OnboardingService.getMeOnboarding(),
			});
			setMeData(progress);
			applyProgress(
				progress,
				{
					setStep0Values,
					setStep1Values,
					setStep2Values,
					setStep3Values,
					setStep4Values,
					setStep5Values,
					setSelfResumeKey,
				},
				false,
			);
			setSelfOtpSent(false);
			setSelfOtpEmail("");
			pushStep(nextIncompleteSelfStep(progress));
			return true;
		},
		[pushStep, queryClient],
	);

	const handleBackToEmail = useCallback(() => {
		setSelfOtpSent(false);
		setSelfOtpEmail("");
	}, []);

	const handleResendSelfOtp = useCallback(async (email: string) => {
		const { error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
			fetchOptions: {
				body: {
					email,
					type: "sign-in",
					portal: "candidate",
				},
			},
		});

		if (error) {
			throw new Error(error.message ?? "Failed to resend OTP");
		}
		return true;
	}, []);

	return {
		isInviteMode,
		step,
		meData,
		meLoading,
		meError,
		step0Values,
		step1Values,
		step2Values,
		step3Values,
		step4Values,
		step5Values,
		setStep0Values,
		setStep1Values,
		setStep2Values,
		setStep3Values,
		setStep4Values,
		setStep5Values,
		selfOtpEmail,
		selfOtpSent,
		selfResumeKey,
		inviteFinalizePending,
		selfFinalizePending,
		questionnaires,
		questionnaireAnswers,
		questionnairesLoading,
		savingScopeId,
		handleSaveScopeAnswers,
		handleStep0Continue,
		handleStep1Back,
		handleLogout,
		handleStep1Continue,
		handleStep2Back,
		handleStep2Continue,
		handleStep3Back,
		handleStep3Submit,
		handlePreferencesStepBack,
		handlePreferencesStepContinue,
		handleSubmissionReadinessBack,
		handleSelfSubmissionFinalize,
		handleInviteSubmissionFinalize,
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
