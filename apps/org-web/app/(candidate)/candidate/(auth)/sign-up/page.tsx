import type { Metadata } from "next";
import { CandidateSignUpView } from "@/components/candidate-sign-up/views/CandidateSignUpView";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create your candidate account",
};

export default function OrgCandidateSignUpPage() {
	return <CandidateSignUpView />;
}
