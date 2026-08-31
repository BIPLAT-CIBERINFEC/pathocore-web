<#ftl output_format="plainText">
${msg("emailVerificationSubject")}

${msg("emailVerificationIntro", realmName)}

Account: ${realmName}
Action: ${msg("emailVerificationAction")}
Expires: ${linkExpirationFormatter(linkExpiration)}

Verify your email:
${link}

${msg("emailVerificationAfter")}

${msg("emailVerificationIgnore")}

PathoCore / MEPRAM DataHub
Technical platform: BIPLAT-CIBERINFEC
https://github.com/BIPLAT-CIBERINFEC/
