import { authClient } from "@/lib/auth-client";

export type UpdateProfileInput = {
	name: string;
	phoneNumber: string;
	officePhone: string;
	timeZone: string;
};

export class AuthService {
	static async updateProfile(input: UpdateProfileInput) {
		return authClient.updateUser(input);
	}
}
