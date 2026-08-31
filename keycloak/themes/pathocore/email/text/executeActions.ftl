<#ftl output_format="plainText">
<#assign requiredActionsText><#if requiredActions??><#list requiredActions><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#items></#list><#else></#if></#assign>
${msg("executeActionsSubject")}

${msg("executeActionsIntro", realmName)}

Account: ${realmName}
Required actions: ${requiredActionsText}
Expires: ${linkExpirationFormatter(linkExpiration)}

Set up your account:
${link}

${msg("executeActionsAfterSetup")}

${msg("executeActionsIgnore")}

PathoCore / MEPRAM DataHub
Technical platform: BIPLAT-CIBERINFEC
https://github.com/BIPLAT-CIBERINFEC/
