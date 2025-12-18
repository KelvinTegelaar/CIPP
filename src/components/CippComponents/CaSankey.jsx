import { CippSankey } from "./CippSankey";

export const CaSankey = ({ data }) => {
  return (
    <CippSankey
      data={{
        nodes: [
          {
            id: "User sign in",
            nodeColor: "hsl(28, 100%, 53%)",
          },
          {
            id: "No CA applied",
            nodeColor: "hsl(0, 100%, 50%)",
          },
          {
            id: "CA applied",
            nodeColor: "hsl(12, 76%, 61%)",
          },
          {
            id: "No MFA",
            nodeColor: "hsl(0, 69%, 50%)",
          },
          {
            id: "MFA",
            nodeColor: "hsl(99, 70%, 50%)",
          },
        ],
        links: data,
      }}
    />
  );
};
