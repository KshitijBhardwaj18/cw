import type { UserStatus, VendorUserRole } from "@repo/shared";
import { splitFullNameToFirstLast as splitFullName } from "@repo/shared";
import type { VendorUserTableRow } from "@/types/users";
import type { VendorDetail } from "@/types/vendor";

export function vendorUsersToTableRows(
	vendorUsers: VendorDetail["vendorUsers"],
	vendorId: string,
): VendorUserTableRow[] {
	return vendorUsers.map((vu) => {
		const { firstName, lastName } = splitFullName(vu.user.name);
		return {
			id: vu.id,
			vendorId,
			vendorName: "",
			firstName,
			lastName,
			title: vu.user.title ?? null,
			email: vu.user.email,
			officePhone: vu.user.officePhone ?? null,
			phoneNumber: vu.user.phoneNumber ?? null,
			role: vu.role as VendorUserRole,
			status: vu.user.status as UserStatus,
		};
	});
}
