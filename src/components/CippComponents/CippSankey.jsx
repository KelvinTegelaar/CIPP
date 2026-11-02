import { useMemo } from "react";
import { ResponsiveSankey } from "@nivo/sankey";
import { Box, ButtonBase, Typography, useTheme } from "@mui/material";
import { useIsMobileLayout } from "../../hooks/use-breakpoint";

// A node's weight: what flows in, or out if nothing flows in (the leftmost column).
const nodeTotals = (data) => {
  const incoming = new Map();
  const outgoing = new Map();
  (data?.links ?? []).forEach((link) => {
    incoming.set(link.target, (incoming.get(link.target) ?? 0) + (link.value ?? 0));
    outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + (link.value ?? 0));
  });
  return (data?.nodes ?? []).map((node) => ({
    ...node,
    total: incoming.get(node.id) ?? outgoing.get(node.id) ?? 0,
  }));
};

export const CippSankey = ({ data, onNodeClick, onLinkClick }) => {
  // The painted palette, not the theme *setting*: when the setting is "browser" the app
  // resolves dark/light from the OS preference, so checking the setting for "dark" said
  // light while the page was dark — and a "multiply" blend over a dark card composites the
  // link ribbons to black.
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === "dark";
  // A sankey is three columns of nodes plus their labels. At desktop widths the labels sit
  // horizontally inside an 18px-thick node and still read. On a ~350px card they cannot: a
  // node carrying a handful of users is a couple of pixels tall, and its label — rotated or
  // not — is longer than the node it belongs to, so the small ones pile on top of each other
  // into an unreadable smear. Below md the chart drops its labels and names the nodes in a
  // legend underneath, where there is room to read them and a real tap target per node.
  const isMobile = useIsMobileLayout();
  const legend = useMemo(() => (isMobile ? nodeTotals(data) : []), [isMobile, data]);

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
        fontSize: isMobile ? 9 : 12,
        // A label sits on whichever band it belongs to, and those run from bright green to
        // deep blue, so no single ink contrasts with all of them. A halo in the card colour
        // separates the glyphs from the band underneath.
        ...(isDark && {
          stroke: muiTheme.palette.background.paper,
          strokeWidth: 3,
          paintOrder: "stroke",
          strokeLinejoin: "round",
        }),
      },
    },
  };

  return (
    <div
      className={`h-full w-full ${isDark ? "sankey-dark-mode" : "sankey-light-mode"}`}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        cursor: onNodeClick || onLinkClick ? "pointer" : "default",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveSankey
          data={data}
          theme={theme}
          margin={
            isMobile
              ? { top: 6, right: 4, bottom: 6, left: 4 }
              : { top: 10, right: 10, bottom: 10, left: 10 }
          }
          align="justify"
          colors={(node) => node.nodeColor}
          label={(node) => node.label ?? node.id}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={isMobile ? 10 : 18}
          nodeSpacing={isMobile ? 12 : 24}
          nodeBorderWidth={0}
          nodeBorderColor={{
            from: "color",
            modifiers: [["darker", 0.8]],
          }}
          nodeBorderRadius={3}
          linkOpacity={isMobile ? 0.75 : 0.5}
          linkHoverOthersOpacity={0.1}
          // Contracting each end eats into the gap between node columns; on a narrow chart
          // that gap is small enough that 3px a side visibly thins the ribbons.
          linkContract={isMobile ? 0 : 3}
          // mix-blend-mode on SVG is unreliable in mobile WebKit — combined with a gradient
          // fill it can composite the ribbons to nothing, which shows as bare node bars with
          // no links between them. Blend is decoration here, so mobile renders them plainly
          // and leans on opacity instead.
          linkBlendMode={isMobile ? "normal" : isDark ? "lighten" : "multiply"}
          enableLinkGradient={!isMobile}
          enableLabels={!isMobile}
          labelPosition="inside"
          labelOrientation={isMobile ? "vertical" : "horizontal"}
          labelPadding={isMobile ? 6 : 16}
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
      {isMobile && legend.length > 0 && (
        <Box
          component="ul"
          sx={{
            listStyle: "none",
            m: 0,
            mt: 1,
            p: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 1,
            rowGap: 0.25,
          }}
        >
          {legend.map((node) => (
            <Box component="li" key={node.id} sx={{ minWidth: 0 }}>
              <ButtonBase
                onClick={() => onNodeClick?.(node)}
                disabled={!onNodeClick}
                sx={{
                  width: "100%",
                  minHeight: 28,
                  px: 0.5,
                  borderRadius: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  textAlign: "left",
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: 0.5,
                    flexShrink: 0,
                    bgcolor: node.nodeColor,
                  }}
                />
                <Typography variant="caption" noWrap sx={{ minWidth: 0, flex: 1 }}>
                  {node.label ?? node.id}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums"
                  }}>
                  {node.total}
                </Typography>
              </ButtonBase>
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
};
