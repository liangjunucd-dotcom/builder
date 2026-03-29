"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { StudioNode } from "@/lib/studios-mock";

// Fix leaflet default icon issue in Next.js
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons based on status
const createStatusIcon = (status: string) => {
  const color =
    status === "online"
      ? "#10b981"
      : status === "degraded"
        ? "#f59e0b"
        : "#71717a";

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface StudioMapProps {
  studios: StudioNode[];
  onStudioClick: (studio: StudioNode) => void;
  onStudioDoubleClick: (studio: StudioNode) => void;
}

function MapBounds({ studios }: { studios: StudioNode[] }) {
  const map = useMap();

  useEffect(() => {
    if (studios.length > 0) {
      const bounds = L.latLngBounds(studios.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [studios, map]);

  return null;
}

export default function StudioMap({
  studios,
  onStudioClick,
  onStudioDoubleClick,
}: StudioMapProps) {
  return (
    <MapContainer
      center={[35.8617, 104.1954]} // Default center (China)
      zoom={4}
      style={{ height: "100%", width: "100%", background: "#141414" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapBounds studios={studios} />

      {studios.map((studio) => (
        <Marker
          key={studio.id}
          position={[studio.lat, studio.lng]}
          icon={createStatusIcon(studio.status)}
          eventHandlers={{
            click: () => onStudioClick(studio),
            dblclick: () => onStudioDoubleClick(studio),
          }}
        >
          <Popup className="studio-popup">
            <div className="p-1">
              <div className="font-medium text-zinc-900">{studio.name}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {studio.model} · {studio.status}
              </div>
              <div
                className="text-xs text-blue-600 mt-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onStudioDoubleClick(studio);
                }}
              >
                Double-click to enter lab &rarr;
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
