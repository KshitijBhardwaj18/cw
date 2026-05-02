export function signInOTPTemplate(emailOrName: string, otp: string): string {
	return `Hi ${emailOrName},

Your verification code is ${otp}. It expires in 5 minutes.

If you did not request this, you can ignore this email.`;
}

export function resetPasswordTemplate(
	name: string,
	callbackURL: string,
): string {
	return `Hi ${name},

Please reset your password by clicking the link below:
${callbackURL}

If you did not request a password reset, you can safely ignore this email.

Thanks,
Team StaffLogic`;
}
