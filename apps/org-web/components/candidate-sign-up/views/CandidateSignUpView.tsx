"use client";

import { OTPForm } from "@repo/ui/components/auth-otp-form";
import { Card, CardContent } from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/components/AuthLayout";
import { CandidateSignUpProgress } from "@/components/candidate-sign-up/CandidateSignUpProgress";
import { ContactInformationStep } from "@/components/candidate-sign-up/steps/ContactInformationStep";
import { CreateAccountStep } from "@/components/candidate-sign-up/steps/CreateAccountStep";
import { LocationPreferencesStep } from "@/components/candidate-sign-up/steps/LocationPreferencesStep";
import { ProfessionalDetailsStep } from "@/components/candidate-sign-up/steps/ProfessionalDetailsStep";
import { useCandidateSignUp } from "@/hooks/candidate/use-candidate-sign-up";

export function CandidateSignUpView() {
	const {
		orgId,
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
	} = useCandidateSignUp();

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
										orgId={meData.organizationId}
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
										orgId={meData.organizationId}
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
										orgId={orgId}
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
										orgId={orgId ?? ""}
									/>
								)}
							</>
						)}
						<Separator />
						<div className="text-center">
							<p className="text-muted-foreground text-sm">
								Already have an account?{" "}
								<Link
									href="/sign-in"
									className="font-medium underline underline-offset-4 hover:text-foreground"
								>
									Sign In
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthLayout>
	);
}
