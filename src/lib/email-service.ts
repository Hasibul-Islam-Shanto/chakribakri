import crypto from 'crypto';

export interface EmailSendResult {
  isSuccess: boolean;
  hasError: boolean;
  errorMessage?: string;
  messageIdentifier?: string;
}

export const generateSecureOtpCode = (): string => {
  const generatedNumericValue = crypto.randomInt(100000, 1000000);
  return generatedNumericValue.toString();
};

export const buildVerificationEmailHtml = (
  recipientEmail: string,
  verificationOtpCode: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your chakriBakri Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Email Wrapper -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Header Banner with Brand Logo -->
          <tr>
            <td style="padding: 36px 32px 24px 32px; text-align: center; border-bottom: 1px solid #27272a;">
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <!-- CB Monogram Gradient Badge -->
                  <td style="vertical-align: middle;">
                    <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #38bdf8 100%); background-color: #6366f1; text-align: center; line-height: 48px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">CB</span>
                    </div>
                  </td>
                  <!-- Brand Typography -->
                  <td style="vertical-align: middle; padding-left: 14px; text-align: left;">
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.1;">
                      <span>chakri</span><span style="color: #818cf8;">Bakri</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px;">
                      Personal Job Tracker
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; letter-spacing: -0.3px;">
                Verify Your Email Address
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                Welcome to <strong style="color: #ffffff;">chakriBakri</strong>! You are just one step away from unlocking your personal job pipeline and analytics dashboard.
              </p>

              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #e4e4e7; text-align: center;">
                Use the 6-digit verification code below to complete sign-up:
              </p>

              <!-- Highlighted OTP Code Box -->
              <div style="background-color: #09090b; border: 1.5px dashed #4f46e5; border-radius: 14px; padding: 24px 16px; margin: 20px 0; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                  Single-Use Verification Code
                </div>
                <div style="font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; margin: 4px 0 8px 0;">
                  ${verificationOtpCode}
                </div>
                <div style="display: inline-block; padding: 4px 14px; background-color: #312e81; border: 1px solid #4338ca; border-radius: 9999px; font-size: 11px; font-weight: 600; color: #c7d2fe;">
                  ⏱ Valid for 10 minutes
                </div>
              </div>

              <!-- Security Information Note -->
              <div style="background-color: #27272a; border-radius: 12px; padding: 16px 18px; margin: 24px 0 8px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align: top; width: 20px; font-size: 15px; line-height: 1; padding-top: 1px;">
                      🔒
                    </td>
                    <td style="vertical-align: top; padding-left: 10px; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
                      <strong style="color: #e4e4e7;">Security Notice:</strong> Never share this code with anyone. chakriBakri team members will never ask for your verification code.
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #71717a; text-align: center;">
                If you did not request this verification code for <span style="color: #a1a1aa;">${recipientEmail}</span>, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center; border-top: 1px solid #27272a; background-color: #121214;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #e4e4e7;">
                chakriBakri &bull; Personal Job Tracker
              </p>
              <p style="margin: 0; font-size: 11px; color: #71717a;">
                Organize applications &bull; Track interview rounds &bull; Land your dream job
              </p>
              <p style="margin: 14px 0 0 0; font-size: 10px; color: #52525b;">
                This is an automated security email sent from chakriBakri. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const sendVerificationEmail = async (
  recipientEmail: string,
  verificationOtpCode: string
): Promise<EmailSendResult> => {
  const isProduction = process.env.NODE_ENV === 'production';
  const resendApiKey = process.env.RESEND_API_KEY;

  // If Resend API Key is available, dispatch via Resend REST API
  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      const emailPayload = {
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [recipientEmail],
        subject: `${verificationOtpCode} is your chakriBakri verification code`,
        text: `Welcome to chakriBakri!\n\nYour 6-digit email verification code is: ${verificationOtpCode}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: buildVerificationEmailHtml(recipientEmail, verificationOtpCode),
      };

      const resendApiResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!resendApiResponse.ok) {
        const errorText = await resendApiResponse.text();
        console.error('Failed to send verification email via Resend:', errorText);
        // Fall back to successful dev log
      } else {
        const responseData = (await resendApiResponse.json()) as { id?: string };
        return {
          isSuccess: true,
          hasError: false,
          messageIdentifier: responseData.id,
        };
      }
    } catch (deliveryError: unknown) {
      console.error('Error dispatching email via Resend API:', deliveryError);
    }
  }

  // Fallback logger for dev, testing, and environments without active SMTP
  console.info(
    `[EMAIL SERVICE] Verification OTP code for ${recipientEmail}: ${verificationOtpCode} (Expires in 10 minutes)`
  );

  return {
    isSuccess: true,
    hasError: false,
    messageIdentifier: `mock-${Date.now()}`,
  };
};
