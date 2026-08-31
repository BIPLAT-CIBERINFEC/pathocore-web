<#ftl output_format="HTML">
<#import "template.ftl" as layout>
<@layout.emailLayout title=msg("emailVerificationSubject")>
  <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
    ${msg("emailVerificationIntro", realmName)}
  </p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:6px;border-collapse:separate;border-spacing:0;overflow:hidden;">
    <tr>
      <td style="padding:12px 16px;color:#475569;width:34%;">Account</td>
      <td style="padding:12px 16px;color:#0f172a;font-weight:600;">${realmName}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;color:#475569;border-top:1px solid #e2e8f0;">Action</td>
      <td style="padding:12px 16px;color:#0f172a;border-top:1px solid #e2e8f0;">${msg("emailVerificationAction")}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;color:#475569;border-top:1px solid #e2e8f0;">Expires</td>
      <td style="padding:12px 16px;color:#0f172a;border-top:1px solid #e2e8f0;">${linkExpirationFormatter(linkExpiration)}</td>
    </tr>
  </table>
  <p style="margin:24px 0 0;">
    <a href="${link}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:4px;font-weight:600;">
      Verify email
    </a>
  </p>
  <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#475569;">
    ${msg("emailVerificationAfter")}
  </p>
  <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;">
    ${msg("emailVerificationIgnore")}
  </p>
</@layout.emailLayout>
