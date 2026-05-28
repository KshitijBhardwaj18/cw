import { ApiClient } from "@/lib/api-client";

const base = (placementId: string) =>
	`/api/vendor/placements/${placementId}/compliance-items`;

export class VendorPlacementComplianceService {
	static async updateStatus(
		placementId: string,
		complianceListItemId: string,
		body: { status: string; notes?: string; expiryDate?: string },
	): Promise<void> {
		await ApiClient.patch(
			`${base(placementId)}/${complianceListItemId}/status`,
			body,
		);
	}

	static async uploadDocument(
		placementId: string,
		complianceListItemId: string,
		file: File,
		opts: { expiryDate?: string; issueDate?: string } = {},
	): Promise<void> {
		const fd = new FormData();
		fd.append("file", file);
		if (opts.expiryDate) fd.append("expiryDate", opts.expiryDate);
		if (opts.issueDate) fd.append("issueDate", opts.issueDate);
		await ApiClient.post(
			`${base(placementId)}/${complianceListItemId}/document`,
			fd,
		);
	}

	static async markLinkSubmitted(
		placementId: string,
		complianceListItemId: string,
	): Promise<void> {
		await ApiClient.post(
			`${base(placementId)}/${complianceListItemId}/mark-link-submitted`,
			{},
		);
	}
}
