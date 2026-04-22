"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { MapPickerProps } from "@/components/location/map-picker-inner";

const MapPickerClient = dynamic(() => import("@/components/location/map-picker-inner").then((module) => module.MapPickerInner), {
  ssr: false,
  loading: () => <Skeleton className="h-[360px] w-full" />
});

export function MapPicker(props: MapPickerProps) {
  return <MapPickerClient {...props} />;
}
