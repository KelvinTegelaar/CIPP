import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

export default function CippMap({
  markers = [],
  zoom = 11,
  mapSx = { height: "400px", width: "600px" },
  ...props
}) {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && markers.length > 1) {
      const bounds = markers.map((marker) => marker.position);
      mapRef.current.fitBounds(bounds, { padding: [25, 25] });
    }
  }, [markers]);

  return (
    <MapContainer
      center={markers?.[0]?.position ?? [0, 0]}
      zoom={zoom}
      scrollWheelZoom={true}
      style={mapSx}
      {...props}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker?.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
