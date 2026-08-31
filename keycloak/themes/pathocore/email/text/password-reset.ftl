<#ftl output_format="plainText">
${msg("passwordResetSubject")}

${msg("passwordResetIntro", realmName)}

Account: ${realmName}
Action: ${msg("passwordResetAction")}
Expires: ${linkExpirationFormatter(linkExpiration)}

Reset your password:
${link}

${msg("passwordResetAfter")}

${msg("passwordResetIgnore")}

PathoCore / MEPRAM DataHub
Technical platform: BIPLAT-CIBERINFEC
https://github.com/BIPLAT-CIBERINFEC/
