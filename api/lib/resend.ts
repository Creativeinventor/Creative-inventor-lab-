import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Creative Inventor <onboarding@resend.dev>';
const isResendConfigured = Boolean(resendApiKey && !resendApiKey.includes('123456789'));

const resendClient = isResendConfigured ? new Resend(resendApiKey) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateType: 'WELCOME' | 'PASSWORD_RESET' | 'EXPIRY_REMINDER' | 'EXPIRED' | 'RENEWED' | 'DISABLED';
  data: Record<string, string | number>;
}

export async function sendPortalEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, templateType, data } = options;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  const html = generateBrandedHtml(templateType, data, appUrl);

  if (!isResendConfigured || !resendClient) {
    console.log(`[Resend Simulated Email to ${to}] Subject: "${subject}" (${templateType})`);
    return {
      success: true,
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  try {
    const result = await resendClient.emails.send({
      from: resendFromEmail,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('[Resend Error]', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Resend Exception]', message);
    return { success: false, error: message };
  }
}

function generateBrandedHtml(
  templateType: string,
  data: Record<string, string | number>,
  appUrl: string
): string {
  const brandName = 'Creative Inventor';
  const youtubeUrl = 'https://youtube.com/@creativeinventorlab';

  const header = `
    <div style="background-color: #030712; padding: 32px 24px; text-align: center; border-bottom: 2px solid #0284c7;">
      <h1 style="color: #38bdf8; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
        CREATIVE INVENTOR
      </h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; font-family: monospace;">
        PROJECT & HARDWARE ARCHIVE PORTAL
      </p>
    </div>
  `;

  const footer = `
    <div style="background-color: #0a0f1d; padding: 24px; text-align: center; border-top: 1px solid #1e293b; font-family: sans-serif; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 8px 0;">Official YouTube Channel: <a href="${youtubeUrl}" style="color: #38bdf8; text-decoration: none;">@creativeinventorlab</a></p>
      <p style="margin: 0;">This email was sent regarding your manually verified subscription at Creative Inventor.</p>
    </div>
  `;

  let body = '';

  if (templateType === 'WELCOME') {
    body = `
      <div style="padding: 32px 24px; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0;">Welcome to the Subscriber Portal, ${data.name || 'Maker'}!</h2>
        <p style="color: #cbd5e1;">Your subscriber access to the Creative Inventor Project Portal has been activated by the channel administrator.</p>
        
        <div style="background-color: #0d1527; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Assigned User ID:</td>
              <td style="padding: 6px 0; color: #38bdf8; font-family: monospace; font-weight: bold; text-align: right;">${data.userId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Email Address:</td>
              <td style="padding: 6px 0; color: #f8fafc; text-align: right;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Subscription Active:</td>
              <td style="padding: 6px 0; color: #4ade80; text-align: right;">${data.subscriptionStart || 'Today'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Subscription Expiry:</td>
              <td style="padding: 6px 0; color: #f87171; text-align: right;">${data.subscriptionExpiry}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Duration:</td>
              <td style="padding: 6px 0; color: #f8fafc; text-align: right;">${data.durationDays} Days</td>
            </tr>
          </table>
        </div>

        <p style="color: #cbd5e1;">Click below to set up your password and access your assigned hardware projects, Gerber archives, and code files:</p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.setupUrl || appUrl + '/setup-password?uid=' + data.uid}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 15px;">
            Set Your Password & Login
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px;">Login URL: <a href="${appUrl}/login" style="color: #38bdf8;">${appUrl}/login</a></p>
      </div>
    `;
  } else if (templateType === 'EXPIRY_REMINDER') {
    body = `
      <div style="padding: 32px 24px; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
        <h2 style="color: #fbbf24; font-size: 20px; margin-top: 0;">Subscription Expiring Soon</h2>
        <p style="color: #cbd5e1;">Hello ${data.name}, your subscription for User ID <strong>${data.userId}</strong> is expiring on <strong>${data.subscriptionExpiry}</strong> (remaining: ${data.remainingDays} days).</p>
        <p style="color: #cbd5e1;">To renew your subscription without losing download access, please contact the channel admin on WhatsApp or YouTube.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${appUrl}" style="background-color: #0284c7; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Visit Portal</a>
        </div>
      </div>
    `;
  } else {
    body = `
      <div style="padding: 32px 24px; color: #f1f5f9; font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0;">Creative Inventor Portal Notification</h2>
        <p style="color: #cbd5e1;">User ID: <strong>${data.userId || ''}</strong></p>
        <p style="color: #cbd5e1;">${data.message || 'Important update regarding your account status.'}</p>
        <p style="color: #94a3b8; font-size: 13px;">Visit the portal: <a href="${appUrl}" style="color: #38bdf8;">${appUrl}</a></p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background-color: #050b18;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          ${header}
          ${body}
          ${footer}
        </div>
      </body>
    </html>
  `;
}
