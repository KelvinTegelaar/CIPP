import { useEffect, useState } from "react";
import { Skeleton } from "@mui/material";
import { Grid } from "@mui/system";
import dynamic from "next/dynamic";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippPropertyList } from "./CippPropertyList";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
const CippMap = dynamic(() => import("./CippMap"), { ssr: false });

export default function CippGeoLocation({
  ipAddress,
  cardProps,
  showIpAddress = false,
  displayIpAddress = null,
}) {
  const [locationInfo, setLocationInfo] = useState(null);

  const markerProperties = ["timezone", "as", "proxy", "hosting", "mobile"];
  const includeProperties = ["org", "city", "region", "country", "zip"];

  // Use displayIpAddress if provided, otherwise use ipAddress
  const ipToDisplay = displayIpAddress || ipAddress;

  // Add IP address to properties if showIpAddress is true
  const initialIncludeProperties = showIpAddress
    ? ["ipAddress", ...includeProperties]
    : includeProperties;
  const initialPropertyList = initialIncludeProperties.map((key) => ({
    label: getCippTranslation(key === "ipAddress" ? "IP Address" : key),
    value: key === "ipAddress" ? ipToDisplay : "",
  }));

  const [properties, setProperties] = useState(initialPropertyList);

  const [markerPopupContents, setMarkerPopupContents] = useState(null);

  const geoLookup = ApiPostCall({
    urlFromData: true,
    queryKey: "GeoIPLookup-" + ipAddress,
    onResult: (result) => {
      setLocationInfo(result);
      var propertyList = [];

      // Add IP address property if showIpAddress is true
      if (showIpAddress) {
        propertyList.push({
          label: getCippTranslation("IP Address"),
          value: getCippFormatting(ipToDisplay, "ipAddress"),
        });
      }

      // Add other properties
      includeProperties.map((key) => {
        propertyList.push({
          label: getCippTranslation(key),
          value: getCippFormatting(result[key], key),
        });
      });
      setProperties(propertyList);

      setMarkerPopupContents(
        <div>
          {markerProperties.map((key) => (
            <div key={key}>
              <strong>{getCippTranslation(key)}:</strong> {getCippFormatting(result[key], key)}
            </div>
          ))}
        </div>
      );
    },
  });

  useEffect(() => {
    if (ipAddress) {
      geoLookup.mutate({
        url: "/api/ExecGeoIPLookup",
        data: {
          IP: ipAddress,
        },
      });
    }
  }, [ipAddress]);

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 8 }}>
        {geoLookup.isPending ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <>
            {locationInfo && locationInfo.lat && locationInfo.lon && (
              <CippMap
                markers={[
                  { position: [locationInfo.lat, locationInfo.lon], popup: markerPopupContents },
                ]}
                zoom={11}
                mapSx={{ height: "400px", width: "100%" }}
              />
            )}
          </>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CippPropertyList
          propertyItems={properties}
          showDivider={false}
          isFetching={geoLookup.isPending}
        />
      </Grid>
    </Grid>
  );
}
