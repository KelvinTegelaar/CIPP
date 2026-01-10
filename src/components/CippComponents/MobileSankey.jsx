import { CippSankey } from "./CippSankey";

export const MobileSankey = ({ data }) => {
  return (
    <CippSankey
      data={{
        nodes: [
          {
            id: "Mobile devices",
            nodeColor: "hsl(28, 100%, 53%)",
          },
          {
            id: "Android",
            nodeColor: "hsl(35, 100%, 50%)",
          },
          {
            id: "iOS",
            nodeColor: "hsl(210, 100%, 50%)",
          },
          {
            id: "Android (Company)",
            nodeColor: "hsl(30, 100%, 45%)",
          },
          {
            id: "Android (Personal)",
            nodeColor: "hsl(40, 100%, 55%)",
          },
          {
            id: "iOS (Company)",
            nodeColor: "hsl(210, 100%, 45%)",
          },
          {
            id: "iOS (Personal)",
            nodeColor: "hsl(210, 100%, 55%)",
          },
          {
            id: "Compliant",
            nodeColor: "hsl(99, 70%, 50%)",
          },
          {
            id: "Non-compliant",
            nodeColor: "hsl(0, 100%, 50%)",
          },
        ],
        links: data,
      }}
    />
  );
};
