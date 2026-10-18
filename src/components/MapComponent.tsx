"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

// Configuration propre des icônes Leaflet pour éviter les erreurs d'affichage
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapComponentProps {
  onSelectLocation: (lat: number, lng: number) => void;
}

function LocationMarker({ onSelectLocation }: MapComponentProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function MapComponent({ onSelectLocation }: MapComponentProps) {
  const defaultCenter = { lat: 33.5731, lng: -7.5898 }; // Casablanca / Settat

  return (
    <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={9} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onSelectLocation={onSelectLocation} />
    </MapContainer>
  );
}