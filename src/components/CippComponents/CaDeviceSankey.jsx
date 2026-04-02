import { CippSankey } from "./CippSankey";

export const CaDeviceSankey = ({ data }) => {
  return (
    <CippSankey
      data={{
        nodes: [
          {
            id: "User sign in",
            nodeColor: "hsl(28, 100%, 53%)",
          },
          {
            id: "Unmanaged",
            nodeColor: "hsl(0, 100%, 50%)",
          },
          {
            id: "Managed",
            nodeColor: "hsl(12, 76%, 61%)",
          },
          {
            id: "Non-compliant",
            nodeColor: "hsl(0, 100%, 50%)",
          },
          {
            id: "Compliant",
            nodeColor: "hsl(99, 70%, 50%)",
          },
        ],
        links: data,
      }}
    />
  );
};
