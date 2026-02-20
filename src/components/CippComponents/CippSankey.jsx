import { ResponsiveSankey } from "@nivo/sankey";
import { useSettings } from "../../hooks/use-settings";

export const CippSankey = ({ data, onNodeClick, onLinkClick }) => {
  const settings = useSettings();
  const isDark = settings.currentTheme?.value === "dark";

  const theme = {
    tooltip: {
      container: {
        background: isDark ? "rgba(33, 33, 33, 0.95)" : "rgba(255, 255, 255, 0.95)",
        color: isDark ? "#ffffff" : "#000000",
        border: isDark ? "1px solid #555" : "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        fontSize: "12px",
        padding: "8px 12px",
      },
    },
    labels: {
      text: {
        fontSize: 12,
      },
    },
  };

  return (
    <div
      className={`h-full w-full ${isDark ? "sankey-dark-mode" : "sankey-light-mode"}`}
      style={{
        height: "100%",
        width: "100%",
        cursor: onNodeClick || onLinkClick ? "pointer" : "default",
      }}
    >
      <ResponsiveSankey
        data={data}
        theme={theme}
        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        align="justify"
        colors={(node) => node.nodeColor}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        linkBlendMode={isDark ? "lighten" : "multiply"}
        enableLinkGradient={true}
        labelPosition="inside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={isDark ? "#ffffff" : "#000000"}
        sort="input"
        legends={[]}
        valueFormat={(value) => `${value}`}
        isInteractive={true}
        onClick={(node, event) => {
          if (onNodeClick && node.id) {
            onNodeClick(node);
          } else if (onLinkClick && node.source) {
            onLinkClick(node);
          }
        }}
      />
    </div>
  );
};
