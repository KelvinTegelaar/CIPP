import { CippSankey } from "./CippSankey";

export const AuthMethodSankey = ({ data }) => {
  return (
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
        links: data,
      }}
    />
  );
};
