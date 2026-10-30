"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { HelpResource } from "@/lib/help-resources";

type Props = { resources: HelpResource[]; selectedName?: string; onSelect: (name: string) => void; onViewDetails: (name: string) => void; styleName: string };

const styleBaseUrl = "https://tiles.openfreemap.org/styles/";
maplibregl.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

export function ResourceMap({ resources, selectedName, onSelect, onViewDetails, styleName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const hasSelectedResourceRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onViewDetailsRef = useRef(onViewDetails);
  onSelectRef.current = onSelect;
  onViewDetailsRef.current = onViewDetails;
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({ container: containerRef.current, style: `${styleBaseUrl}${styleName}`, center: [122.5, 12], zoom: 4, pitch: 0, bearing: 0 });
    map.fitBounds([[116, 4], [127.5, 21.5]], { padding: 36, duration: 0 });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;
    return () => { markersRef.current.forEach((marker) => marker.remove()); map.remove(); mapRef.current = null; };
  }, []);
  useEffect(() => { mapRef.current?.setStyle(`${styleBaseUrl}${styleName}`); }, [styleName]);
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = resources.map((resource) => {
      const pin = document.createElement("button");
      pin.type = "button"; pin.className = `promise-map-pin${resource.name === selectedName ? " is-selected" : ""}`; pin.setAttribute("aria-label", `View ${resource.name}`); pin.innerHTML = `<span><img src="/brand/promiselogo.png" alt="" /></span><b>${resource.city}</b>`; pin.onclick = () => onSelectRef.current(resource.name);
      const popup = new maplibregl.Popup({ offset: 48, maxWidth: "280px" }).setHTML(`<div class="map-resource-popup"><strong>${resource.name}</strong><br/><span>${resource.address}</span><br/><small>${resource.city}, ${resource.province}</small><br/><button type="button" class="map-resource-details">View details</button>`);
      popup.on("open", () => popup.getElement()?.querySelector<HTMLButtonElement>(".map-resource-details")?.addEventListener("click", () => onViewDetailsRef.current(resource.name)));
      return new maplibregl.Marker({ element: pin, anchor: "bottom" }).setLngLat([resource.longitude, resource.latitude]).setPopup(popup).addTo(mapRef.current!);
    });
  }, [resources]);
  useEffect(() => {
    if (!hasSelectedResourceRef.current) { hasSelectedResourceRef.current = true; return; }
    markersRef.current.forEach((marker) => marker.getElement().classList.toggle("is-selected", marker.getLngLat().lng === resources.find((item) => item.name === selectedName)?.longitude && marker.getLngLat().lat === resources.find((item) => item.name === selectedName)?.latitude));
    const resource = resources.find((item) => item.name === selectedName);
    if (resource) mapRef.current?.flyTo({ center: [resource.longitude, resource.latitude], zoom: 16, pitch: 45, duration: 700 });
  }, [resources, selectedName]);
  const selectedResource = resources.find((item) => item.name === selectedName);
  return <div className="relative"><div ref={containerRef} className="h-[28rem] w-full sm:h-[38rem] lg:h-[44rem]" aria-label="Interactive Region XII care resource map" />{selectedResource ? <div className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/30 bg-slate-950/80 px-3 py-2 text-white shadow-lg backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Selected care node</p><p className="truncate text-sm font-semibold">{selectedResource.name}</p><p className="text-xs text-white/70">{selectedResource.city}, {selectedResource.province}</p></div> : null}</div>;
}
