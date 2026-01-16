import { CippSankey } from "./CippSankey";

export const CaSankey = ({ data }) => {
  return (
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
        links: data,
      }}
    />
  );
};
