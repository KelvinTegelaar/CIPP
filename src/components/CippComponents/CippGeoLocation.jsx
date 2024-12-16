import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@mui/material";
import { Grid } from "@mui/system";
import dynamic from "next/dynamic";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippPropertyList } from "./CippPropertyList";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
const CippMap = dynamic(() => import("./CippMap"), { ssr: false });

export default function CippGeoLocation({ ipAddress, cardProps }) {
  const [locationInfo, setLocationInfo] = useState(null);
  const [properties, setProperties] = useState([]);

  const markerProperties = ["timezone", "as", "proxy", "hosting", "mobile"];
  const includeProperties = ["org", "city", "region", "country", "zip"];

  const [markerPopupContents, setMarkerPopupContents] = useState(null);

  const geoLookup = ApiPostCall({
    urlFromData: true,
    queryKey: "GeoIPLookup-" + ipAddress,
    onResult: (result) => {
      setLocationInfo(result);
      var propertyList = [];
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
              <strong>{getCippTranslation(key)}:</strong>{" "}
              {getCippFormatting(result[key], key)}
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
    <Card {...cardProps}>
      <CardHeader title={`Location Info for ${ipAddress}`} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 8 }}>
            {locationInfo && locationInfo.lat && locationInfo.lon && (
              <CippMap
                markers={[
                  { position: [locationInfo.lat, locationInfo.lon], popup: markerPopupContents },
                ]}
                zoom={11}
                mapSx={{ height: "400px", width: "100%" }}
              />
            )}
          </Grid>
          <Grid item size={{ xs: 12, sm: 4 }}>
            <CippPropertyList propertyItems={properties} showDivider={false} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
