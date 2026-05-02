import type { Metadata } from "next";
import { MatchesAndJobSearchPageContent } from "@/components/candidate-matches-and-job-search/MatchesAndJobSearchPageContent";

export const metadata: Metadata = {
	title: "Matches & Job Search",
};

export default function MatchesAndJobSearchPage() {
	return <MatchesAndJobSearchPageContent />;
}
