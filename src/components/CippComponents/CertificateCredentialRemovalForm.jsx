import { CippFormComponent } from "./CippFormComponent.jsx";

export const CertificateCredentialRemovalForm = ({ formHook, row }) => {
  return (
    <CippFormComponent
      name="KeyIds"
      type="autoComplete"
      formControl={formHook}
      label="Select Certificate Credentials to Remove"
      multiple
      creatable={false}
      validators={{ required: "Please select at least one certificate credential" }}
      options={
        row?.keyCredentials?.map((cred) => ({
          label: `${cred.displayName || "Unnamed"} (Expiration: ${new Date(
            cred.endDateTime
          ).toLocaleDateString()})`,
          value: cred.keyId,
        })) || []
      }
    />
  );
};
