"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";

export type MapPickerValue = {
  latitude: number;
  longitude: number;
};

export type MapPickerProps = {
  value?: MapPickerValue | null;
  onChange: (value: MapPickerValue) => void;
};

const defaultCenter: [number, number] = [20, 0];

export function MapPickerInner({ value, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "weather-marker",
        html: "<span></span>",
        iconAnchor: [14, 14],
        iconSize: [28, 28]
      }),
    []
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const center: [number, number] = value ? [value.latitude, value.longitude] : defaultCenter;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, value ? 9 : 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker(center, {
      draggable: true,
      icon: markerIcon
    }).addTo(map);

    marker.on("dragend", () => {
      const next = marker.getLatLng();
      onChangeRef.current({ latitude: next.lat, longitude: next.lng });
    });

    map.on("click", (event: L.LeafletMouseEvent) => {
      marker.setLatLng(event.latlng);
      onChangeRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });

    mapRef.current = map;
    markerRef.current = marker;

    window.setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [markerIcon]);

  useEffect(() => {
    if (!value || !mapRef.current || !markerRef.current) {
      return;
    }

    const latLng: [number, number] = [value.latitude, value.longitude];
    markerRef.current.setLatLng(latLng);
    mapRef.current.setView(latLng, Math.max(mapRef.current.getZoom(), 8), { animate: true });
  }, [value?.latitude, value?.longitude]);

  return <div aria-label="OpenStreetMap location picker" className="min-h-[360px] w-full" ref={containerRef} role="application" />;
}
