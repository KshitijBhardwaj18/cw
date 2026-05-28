"use client";

import { OTPForm } from "@repo/ui/components/auth-otp-form";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import Link from "next/link";
import { useMemo } from "react";
import { AuthLayout } from "@/components/auth/components/AuthLayout";
import { CandidateSignUpProgress } from "@/components/candidate-sign-up/CandidateSignUpProgress";
import { ContactInformationStep } from "@/components/candidate-sign-up/steps/ContactInformationStep";
import { CreateAccountStep } from "@/components/candidate-sign-up/steps/CreateAccountStep";
import { LocationPreferencesStep } from "@/components/candidate-sign-up/steps/LocationPreferencesStep";
import { PreferencesQuestionnairesStep } from "@/components/candidate-sign-up/steps/PreferencesQuestionnairesStep";
import { ProfessionalDetailsStep } from "@/components/candidate-sign-up/steps/ProfessionalDetailsStep";
import { SubmissionReadinessStep } from "@/components/candidate-sign-up/steps/SubmissionReadinessStep";
import { useCandidateSignUp } from "@/hooks/candidate/use-candidate-sign-up";

export function CandidateSignUpView() {
	const {
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
		inviteFinalizePending,
		questionnaires,
		questionnaireAnswers,
		questionnairesLoading,
		savingScopeId,
		handleSaveScopeAnswers,
		handleInviteStep0Continue,
		handleInviteContactContinue,
		handleInviteProfessionalContinue,
		handleInviteLocationSubmit,
		handleVerifySelfOtp,
		handleBackToEmail,
		handleResendSelfOtp,
		requestResumeSignedUrl,
		pushStep,
	} = useCandidateSignUp();

	const preferencesDefaultValues = useMemo(
		() => ({
			...step4Values,
			preferredContractLengths: step4Values.preferredContractLengths ?? [],
			totalProfessionalExperienceBand:
				step4Values.totalProfessionalExperienceBand,
		}),
		[step4Values],
	);

	const occupationLabel = useMemo(() => meData?.occupationName ?? "", [meData]);

	if (isInviteMode && meLoading) {
		return (
			<AuthLayout>
				<div className="flex items-center justify-center py-16">
					<p className="text-muted-foreground text-sm">Loading...</p>
				</div>
			</AuthLayout>
		);
	}

	if (isInviteMode && (meError || !meData)) {
		return (
			<AuthLayout>
				<div className="space-y-4 text-center">
					<p className="text-muted-foreground text-sm">
						{meError ?? "Invalid invite link"}
					</p>
					<Link
						href="/sign-in"
						className="text-primary text-sm font-medium underline"
					>
						Go to Sign In
					</Link>
				</div>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout contentClassName="w-full max-w-4xl">
			<div className="flex flex-col">
				<Card className="shadow-none">
					<CardContent className="space-y-6">
						<CandidateSignUpProgress
							currentStep={step}
							isInviteMode={isInviteMode}
						/>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-none">
					<CardContent className="space-y-6">
						{isInviteMode && meData ? (
							<>
								{step === 0 && (
									<CreateAccountStep
										defaultValues={step0Values}
										onContinue={handleInviteStep0Continue}
										onValuesChange={setStep0Values}
										disabledFields={{ email: true }}
									/>
								)}
								{step === 1 && (
									<ContactInformationStep
										defaultValues={step1Values}
										onBack={() => pushStep(0)}
										onContinue={handleInviteContactContinue}
										onValuesChange={setStep1Values}
									/>
								)}
								{step === 2 && (
									<ProfessionalDetailsStep
										defaultValues={step2Values}
										onBack={() => pushStep(1)}
										onContinue={handleInviteProfessionalContinue}
										onValuesChange={setStep2Values}
										inviteMode
										occupationId={meData.occupationId}
										occupationName={meData.occupationName}
										existingResumeKey={selfResumeKey}
										onRequestResumeSignedUrl={requestResumeSignedUrl}
									/>
								)}
								{step === 3 && (
									<LocationPreferencesStep
										defaultValues={step3Values}
										onBack={() => pushStep(2)}
										onSubmit={handleInviteLocationSubmit}
										onValuesChange={setStep3Values}
									/>
								)}
								{step === 4 && (
									<PreferencesQuestionnairesStep
										defaultValues={preferencesDefaultValues}
										occupationName={occupationLabel}
										onBack={handlePreferencesStepBack}
										onContinue={handlePreferencesStepContinue}
										onValuesChange={setStep4Values}
										questionnaires={questionnaires}
										questionnaireAnswers={questionnaireAnswers}
										questionnairesLoading={questionnairesLoading}
										savingScopeId={savingScopeId}
										onSaveScopeAnswers={handleSaveScopeAnswers}
									/>
								)}
								{step === 5 && (
									<SubmissionReadinessStep
										defaultValues={step5Values}
										onValuesChange={setStep5Values}
										onBack={handleSubmissionReadinessBack}
										onContinue={handleInviteSubmissionFinalize}
										isSubmitting={inviteFinalizePending}
									/>
								)}
							</>
						) : (
							<>
								{step === 0 &&
									(!selfOtpSent ? (
										<CreateAccountStep
											defaultValues={step0Values}
											onContinue={handleStep0Continue}
											onValuesChange={setStep0Values}
										/>
									) : (
										<OTPForm
											email={selfOtpEmail}
											onVerifyOTP={handleVerifySelfOtp}
											onBackToEmail={handleBackToEmail}
											onResendOTP={handleResendSelfOtp}
										/>
									))}
								{step === 1 && (
									<ContactInformationStep
										defaultValues={step1Values}
										onBack={handleStep1Back}
										onContinue={handleStep1Continue}
										onValuesChange={setStep1Values}
									/>
								)}
								{step === 2 && (
									<ProfessionalDetailsStep
										defaultValues={step2Values}
										onBack={handleStep2Back}
										onContinue={handleStep2Continue}
										onValuesChange={setStep2Values}
										existingResumeKey={selfResumeKey}
										onRequestResumeSignedUrl={requestResumeSignedUrl}
									/>
								)}
								{step === 3 && (
									<LocationPreferencesStep
										defaultValues={step3Values}
										onBack={handleStep3Back}
										onSubmit={handleStep3Submit}
										onValuesChange={setStep3Values}
									/>
								)}
								{step === 4 && (
									<PreferencesQuestionnairesStep
										defaultValues={preferencesDefaultValues}
										occupationName={occupationLabel}
										onBack={handlePreferencesStepBack}
										onContinue={handlePreferencesStepContinue}
										onValuesChange={setStep4Values}
										questionnaires={questionnaires}
										questionnaireAnswers={questionnaireAnswers}
										questionnairesLoading={questionnairesLoading}
										savingScopeId={savingScopeId}
										onSaveScopeAnswers={handleSaveScopeAnswers}
									/>
								)}
								{step === 5 && (
									<SubmissionReadinessStep
										defaultValues={step5Values}
										onValuesChange={setStep5Values}
										onBack={handleSubmissionReadinessBack}
										onContinue={handleSelfSubmissionFinalize}
									/>
								)}
							</>
						)}
						<Separator />
						<div className="text-center">
							<p className="text-muted-foreground text-sm">
								Already have an account?{" "}
								<Button
									variant="link"
									size="sm"
									onClick={handleLogout}
									className="font-medium underline underline-offset-4 hover:text-foreground p-0 text-muted-foreground"
								>
									Sign In
								</Button>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthLayout>
	);
}
