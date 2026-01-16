import { CippSankey } from "./CippSankey";

export const DesktopDevicesSankey = ({ data }) => {
  //temporary mock sankey for dash - dont delete until replaced.
  return (
    <CippSankey
      data={{
        nodes: [
          {
            id: "Desktop devices",
            nodeColor: "hsl(28, 100%, 53%)",
          },
          {
            id: "Windows",
            nodeColor: "hsl(35, 100%, 50%)",
          },
          {
            id: "macOS",
            nodeColor: "hsl(200, 100%, 50%)",
          },
          {
            id: "Entra joined",
            nodeColor: "hsl(12, 76%, 61%)",
          },
          {
            id: "Entra registered",
            nodeColor: "hsl(12, 76%, 61%)",
          },
          {
            id: "Entra hybrid joined",
            nodeColor: "hsl(12, 76%, 61%)",
          },
          {
            id: "Compliant",
            nodeColor: "hsl(99, 70%, 50%)",
          },
          {
            id: "Non-compliant",
            nodeColor: "hsl(0, 100%, 50%)",
          },
          {
            id: "Unmanaged",
            nodeColor: "hsl(220, 10%, 60%)",
          },
        ],
        links: data,
      }}
    />
  );
};
