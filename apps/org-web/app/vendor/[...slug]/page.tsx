import { notFound } from "next/navigation";

// Catch unknown `/vendor/*` URLs so `app/vendor/not-found.tsx` runs (nested not-found is not used for URL mismatches).
export default function VendorUnmatchedRoutePage() {
	notFound();
}
