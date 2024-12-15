import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function CippMap({
  position,
  zoom,
  markerPopupContents,
  mapSx = { height: "400px", width: "600px" },
  ...props
}) {
  return (
    <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} style={mapSx} {...props}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>{markerPopupContents}</Popup>
      </Marker>
    </MapContainer>
  );
}
