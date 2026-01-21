import { CippSankey } from "./CippSankey";

export const AuthMethodSankey = ({ data }) => {
  // Null safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Count enabled users only
  const enabledUsers = data.filter((user) => user.AccountEnabled === true);

  if (enabledUsers.length === 0) {
    return null;
  }

  // Categorize MFA methods as phishable or phish-resistant
  const phishableMethods = ["mobilePhone", "email", "microsoftAuthenticatorPush"];
  const phishResistantMethods = ["fido2", "windowsHelloForBusiness", "x509Certificate"];

  let singleFactor = 0;
  let phishableCount = 0;
  let phishResistantCount = 0;
  let perUserMFA = 0;

  // Breakdown of phishable methods
  let phoneCount = 0;
  let authenticatorCount = 0;

  // Breakdown of phish-resistant methods
  let passkeyCount = 0;
  let whfbCount = 0;

  enabledUsers.forEach((user) => {
    const methods = user.MFAMethods || [];
    const perUser = user.PerUser === "enforced" || user.PerUser === "enabled";
    const hasRegistered = user.MFARegistration === true;

    // If user has per-user MFA enforced but no specific methods, count as generic MFA
    if (perUser && !hasRegistered && methods.length === 0) {
      perUserMFA++;
      return;
    }

    // Check if user has any MFA methods
    if (!hasRegistered || methods.length === 0) {
      singleFactor++;
      return;
    }

    // Categorize by method type
    const hasPhishResistant = methods.some((m) => phishResistantMethods.includes(m));
    const hasPhishable = methods.some((m) => phishableMethods.includes(m));

    if (hasPhishResistant) {
      phishResistantCount++;
      // Count specific phish-resistant methods
      if (methods.includes("fido2") || methods.includes("x509Certificate")) {
        passkeyCount++;
      }
      if (methods.includes("windowsHelloForBusiness")) {
        whfbCount++;
      }
    } else if (hasPhishable) {
      phishableCount++;
      // Count specific phishable methods
      if (methods.includes("mobilePhone") || methods.includes("email")) {
        phoneCount++;
      }
      if (
        methods.includes("microsoftAuthenticatorPush") ||
        methods.includes("softwareOneTimePasscode")
      ) {
        authenticatorCount++;
      }
    } else {
      // Has MFA methods but not in our categorized lists
      phishableCount++;
      authenticatorCount++;
    }
  });

  const mfaPercentage = (
    ((phishableCount + phishResistantCount + perUserMFA) / enabledUsers.length) *
    100
  ).toFixed(1);
  const phishResistantPercentage = ((phishResistantCount / enabledUsers.length) * 100).toFixed(1);

  const links = [
    { source: "Users", target: "Single factor", value: singleFactor },
    { source: "Users", target: "Multi factor", value: perUserMFA },
    { source: "Users", target: "Phishable", value: phishableCount },
    { source: "Users", target: "Phish resistant", value: phishResistantCount },
  ];

  // Add phishable method breakdowns
  if (phoneCount > 0) links.push({ source: "Phishable", target: "Phone", value: phoneCount });
  if (authenticatorCount > 0)
    links.push({ source: "Phishable", target: "Authenticator", value: authenticatorCount });

  // Add phish-resistant method breakdowns
  if (passkeyCount > 0)
    links.push({ source: "Phish resistant", target: "Passkey", value: passkeyCount });
  if (whfbCount > 0) links.push({ source: "Phish resistant", target: "WHfB", value: whfbCount });

  const description = `${mfaPercentage}% of enabled users have MFA configured. ${phishResistantPercentage}% use phish-resistant authentication methods.`;

  return (
    <>
      <CippSankey
        data={{
          nodes: [
            {
              id: "Users",
              nodeColor: "hsl(28, 100%, 53%)",
            },
            {
              id: "Single factor",
              nodeColor: "hsl(0, 100%, 50%)",
            },
            {
              id: "Multi factor",
              nodeColor: "hsl(200, 70%, 50%)",
            },
            {
              id: "Phishable",
              nodeColor: "hsl(39, 100%, 50%)",
            },
            {
              id: "Phone",
              nodeColor: "hsl(39, 100%, 45%)",
            },
            {
              id: "Authenticator",
              nodeColor: "hsl(39, 100%, 55%)",
            },
            {
              id: "Phish resistant",
              nodeColor: "hsl(99, 70%, 50%)",
            },
            {
              id: "Passkey",
              nodeColor: "hsl(140, 70%, 50%)",
            },
            {
              id: "WHfB",
              nodeColor: "hsl(160, 70%, 50%)",
            },
          ],
          links: links,
        }}
      />
      {description && (
        <div style={{ marginTop: "16px", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)" }}>
          {description}
        </div>
      )}
    </>
  );
};
