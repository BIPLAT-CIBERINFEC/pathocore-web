<#macro emailLayout title="">
<!doctype html>
<html lang="${locale.language}" dir="${(ltr)?then('ltr','rtl')}">
  <body style="margin:0;padding:0;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#0f172a;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#99f6e4;">PathoCore / MEPRAM DataHub</div>
                <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <#nested>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f1f5f9;color:#475569;font-size:13px;line-height:1.5;">
                <strong>Technical platform:</strong>
                <a href="https://github.com/BIPLAT-CIBERINFEC/" style="color:#0f766e;text-decoration:none;">BIPLAT-CIBERINFEC</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
</#macro>
