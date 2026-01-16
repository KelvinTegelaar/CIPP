import { CippSankey } from "./CippSankey";

export const MFASankey = ({ data }) => {
  // Null safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Count enabled users only
  const enabledUsers = data.filter((user) => user.AccountEnabled === true);

  if (enabledUsers.length === 0) {
    return null;
  }

  // Split by MFA registration status
  let registeredUsers = 0;
  let notRegisteredUsers = 0;

  // For registered users, split by protection method
  let registeredCA = 0;
  let registeredSD = 0;
  let registeredPerUser = 0;
  let registeredNone = 0;

  // For not registered users, split by protection method
  let notRegisteredCA = 0;
  let notRegisteredSD = 0;
  let notRegisteredPerUser = 0;
  let notRegisteredNone = 0;

  enabledUsers.forEach((user) => {
    const hasRegistered = user.MFARegistration === true;
    const coveredByCA = user.CoveredByCA?.startsWith("Enforced") || false;
    const coveredBySD = user.CoveredBySD === true;
    const perUserEnabled = user.PerUser === "enforced" || user.PerUser === "enabled";

    // Consider PerUser as MFA enabled/registered
    if (hasRegistered || perUserEnabled) {
      registeredUsers++;
      // Per-User gets its own separate terminal path
      if (perUserEnabled) {
        registeredPerUser++;
      } else if (coveredByCA) {
        registeredCA++;
      } else if (coveredBySD) {
        registeredSD++;
      } else {
        registeredNone++;
      }
    } else {
      notRegisteredUsers++;
      if (coveredByCA) {
        notRegisteredCA++;
      } else if (coveredBySD) {
        notRegisteredSD++;
      } else {
        notRegisteredNone++;
      }
    }
  });

  const registeredPercentage = ((registeredUsers / enabledUsers.length) * 100).toFixed(1);
  const protectedPercentage = (
    ((registeredCA + registeredSD + registeredPerUser) / enabledUsers.length) *
    100
  ).toFixed(1);

  const links = [
    { source: "Enabled users", target: "MFA registered", value: registeredUsers },
    { source: "Enabled users", target: "Not registered", value: notRegisteredUsers },
  ];

  // Add protection methods for registered users
  if (registeredCA > 0)
    links.push({ source: "MFA registered", target: "CA policy", value: registeredCA });
  if (registeredSD > 0)
    links.push({ source: "MFA registered", target: "Security defaults", value: registeredSD });
  if (registeredPerUser > 0)
    links.push({ source: "MFA registered", target: "Per-user MFA", value: registeredPerUser });
  if (registeredNone > 0)
    links.push({ source: "MFA registered", target: "No enforcement", value: registeredNone });

  // Add protection methods for not registered users
  if (notRegisteredCA > 0)
    links.push({ source: "Not registered", target: "CA policy", value: notRegisteredCA });
  if (notRegisteredSD > 0)
    links.push({ source: "Not registered", target: "Security defaults", value: notRegisteredSD });
  if (notRegisteredPerUser > 0)
    links.push({ source: "Not registered", target: "Per-user MFA", value: notRegisteredPerUser });
  if (notRegisteredNone > 0)
    links.push({ source: "Not registered", target: "No enforcement", value: notRegisteredNone });

  const description = `${registeredPercentage}% of enabled users have registered MFA methods. ${protectedPercentage}% are protected by policies requiring MFA.`;

  return (
    <>
      <CippSankey
        data={{
          nodes: [
            {
              id: "Enabled users",
              nodeColor: "hsl(28, 100%, 53%)",
            },
            {
              id: "MFA registered",
              nodeColor: "hsl(99, 70%, 50%)",
            },
            {
              id: "Not registered",
              nodeColor: "hsl(39, 100%, 50%)",
            },
            {
              id: "CA policy",
              nodeColor: "hsl(99, 70%, 50%)",
            },
            {
              id: "Security defaults",
              nodeColor: "hsl(140, 70%, 50%)",
            },
            {
              id: "Per-user MFA",
              nodeColor: "hsl(200, 70%, 50%)",
            },
            {
              id: "No enforcement",
              nodeColor: "hsl(0, 100%, 50%)",
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
