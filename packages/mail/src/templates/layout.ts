import { STAFF_LOGIC_BRAND_NAME } from "@repo/shared";
import {
	MAIL_BRAND_COLORS,
	type MailBranding,
	STAFF_LOGIC_SUPPORT_EMAIL,
} from "../branding.js";

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderLogo(
	url: string | undefined,
	alt: string,
	height: number,
): string {
	if (!url) return "";
	return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" height="${height}" style="display:block;margin:0 auto;max-width:220px;height:${height}px;width:auto;border:0;" />`;
}

export function renderEmailButton(href: string, label: string): string {
	return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px auto 0;">
	<tr>
		<td align="center" style="border-radius:8px;background:${MAIL_BRAND_COLORS.primary};">
			<a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">
				${escapeHtml(label)}
			</a>
		</td>
	</tr>
</table>`;
}

export function renderOtpBlock(otp: string): string {
	const formattedOtp = escapeHtml(otp);
	return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
	<tr>
		<td align="center" style="padding:28px 20px;background:${MAIL_BRAND_COLORS.otpBackground};border:2px dashed ${MAIL_BRAND_COLORS.border};border-radius:12px;">
			<p style="margin:0 0 12px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${MAIL_BRAND_COLORS.muted};">
				Verification code
			</p>
			<p style="margin:0;font-family:'SF Mono',SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:0.35em;color:${MAIL_BRAND_COLORS.text};line-height:1.2;user-select:all;-webkit-user-select:all;">
				${formattedOtp}
			</p>
			<p style="margin:14px 0 0;font-size:13px;color:${MAIL_BRAND_COLORS.muted};">
				Select the code above to copy it
			</p>
		</td>
	</tr>
</table>`;
}

export function renderEmailLayout(
	branding: MailBranding,
	contentHtml: string,
): string {
	const headerLogo = renderLogo(
		branding.primaryLogoUrl,
		branding.senderName,
		48,
	);
	const portalLabel = branding.portalLabel
		? `<p style="margin:10px 0 0;font-size:13px;font-weight:500;color:rgba(255,255,255,0.92);letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(branding.portalLabel)}</p>`
		: "";
	const poweredByFooter = branding.showPoweredBy
		? `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 12px;">
	<tr>
		<td align="center" style="padding:0 8px;">
			<span style="font-size:12px;color:${MAIL_BRAND_COLORS.muted};">Powered by</span>
		</td>
		<td align="center">
			${renderLogo(branding.staffLogicLogoUrl, STAFF_LOGIC_BRAND_NAME, 20)}
		</td>
	</tr>
</table>`
		: "";

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<title>${escapeHtml(branding.senderName)}</title>
</head>
<body style="margin:0;padding:0;background:${MAIL_BRAND_COLORS.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${MAIL_BRAND_COLORS.background};">
		<tr>
			<td align="center" style="padding:40px 16px;">
				<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:${MAIL_BRAND_COLORS.surface};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
					<tr>
						<td align="center" style="padding:32px 32px 28px;background:linear-gradient(135deg, ${MAIL_BRAND_COLORS.primary} 0%, ${MAIL_BRAND_COLORS.primaryDark} 100%);">
							${headerLogo}
							<p style="margin:14px 0 0;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;">
								${escapeHtml(branding.senderName)}
							</p>
							${portalLabel}
						</td>
					</tr>
					<tr>
						<td style="padding:36px 40px 32px;color:${MAIL_BRAND_COLORS.text};font-size:16px;line-height:1.65;">
							${contentHtml}
						</td>
					</tr>
					<tr>
						<td align="center" style="padding:24px 32px 28px;background:#F8FAFC;border-top:1px solid ${MAIL_BRAND_COLORS.border};">
							${poweredByFooter}
							<p style="margin:0;font-size:12px;line-height:1.6;color:${MAIL_BRAND_COLORS.muted};">
								Need help? Contact
								<a href="mailto:${STAFF_LOGIC_SUPPORT_EMAIL}" style="color:${MAIL_BRAND_COLORS.primary};text-decoration:none;">${STAFF_LOGIC_SUPPORT_EMAIL}</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;
}

export function renderParagraph(text: string): string {
	return `<p style="margin:0 0 16px;color:${MAIL_BRAND_COLORS.text};">${escapeHtml(text)}</p>`;
}

export function renderMutedParagraph(text: string): string {
	return `<p style="margin:16px 0 0;font-size:14px;color:${MAIL_BRAND_COLORS.muted};">${escapeHtml(text)}</p>`;
}

export function renderHeading(text: string): string {
	return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${MAIL_BRAND_COLORS.text};line-height:1.3;">${escapeHtml(text)}</h1>`;
}

export function renderLinkFallback(href: string): string {
	return `<p style="margin:16px 0 0;font-size:13px;color:${MAIL_BRAND_COLORS.muted};word-break:break-all;">Or copy this link:<br /><a href="${escapeHtml(href)}" style="color:${MAIL_BRAND_COLORS.primary};">${escapeHtml(href)}</a></p>`;
}

export function renderSummaryTable(
	rows: Array<{ label: string; value: string; highlight?: boolean }>,
): string {
	const rowsHtml = rows
		.map(
			(row) => `
		<tr>
			<td style="padding:10px 0;font-size:14px;color:${MAIL_BRAND_COLORS.muted};border-bottom:1px solid ${MAIL_BRAND_COLORS.border};">${escapeHtml(row.label)}</td>
			<td align="right" style="padding:10px 0;font-size:14px;font-weight:${row.highlight ? "700" : "600"};color:${row.highlight ? MAIL_BRAND_COLORS.primary : MAIL_BRAND_COLORS.text};border-bottom:1px solid ${MAIL_BRAND_COLORS.border};">${escapeHtml(row.value)}</td>
		</tr>`,
		)
		.join("");

	return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;background:${MAIL_BRAND_COLORS.otpBackground};border-radius:12px;padding:4px 16px;">
	${rowsHtml}
</table>`;
}
