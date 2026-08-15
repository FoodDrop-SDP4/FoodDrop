"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { Navigation, ExternalLink, MapPin, Store } from "lucide-react";

interface RiderNavigationMapProps {
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  customerAddress: string;
  orderStatus: string;
}

// Preset Dhaka locations for realistic navigation simulation
const DHAKA_PRESETS = {
  restaurant: [23.7465, 90.3760] as [number, number], // Dhanmondi
  customer: [23.7937, 90.4043] as [number, number], // Banani / Gulshan
};

function generateRoute(
  start: [number, number],
  end: [number, number],
  steps = 25
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curveOffset = Math.sin(t * Math.PI) * 0.007;
    const lat = start[0] + (end[0] - start[0]) * t + curveOffset;
    const lng = start[1] + (end[1] - start[1]) * t + curveOffset * 0.5;
    points.push([lat, lng]);
  }
  return points;
}

export default function RiderNavigationMap({
  restaurantName,
  restaurantAddress,
  customerName,
  customerAddress,
  orderStatus,
}: RiderNavigationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const startCoord = DHAKA_PRESETS.restaurant;
  const endCoord = DHAKA_PRESETS.customer;
  const routePoints = generateRoute(startCoord, endCoord, 25);

  const isHeadingToCustomer = orderStatus === "ON_THE_WAY";
  const targetDestination = isHeadingToCustomer ? customerAddress : restaurantAddress;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.7701, 90.3901],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // 1. Restaurant Marker (Pickup Point)
    const restaurantIcon = L.divIcon({
      className: "custom-res-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(startCoord, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup: ${restaurantName}</b><br/>${restaurantAddress}`);

    // 2. Customer Marker (Drop-off Point)
    const customerIcon = L.divIcon({
      className: "custom-cust-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(endCoord, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>Drop-off: ${customerName}</b><br/>${customerAddress}`);

    // 3. Navigation Route Polyline
    L.polyline(routePoints, {
      color: "#2563eb",
      weight: 5,
      opacity: 0.85,
      dashArray: "6, 6",
    }).addTo(map);

    // 4. Rider Position Marker
    const riderPosition = isHeadingToCustomer
      ? routePoints[Math.floor(routePoints.length * 0.6)]
      : startCoord;

    const riderIcon = L.divIcon({
      className: "custom-rider-nav",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 rounded-full bg-blue-500/30 custom-pulse-ring"></div>
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-2xl border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    L.marker(riderPosition, { icon: riderIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup("<b>Your Current GPS Location 🏍️</b>");

    const bounds = L.latLngBounds([startCoord, endCoord]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [restaurantName, customerName, isHeadingToCustomer]);

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(targetDestination || "Dhaka, Bangladesh");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, "_blank");
  };

  return (
    <div className="relative h-full w-full min-h-[300px] overflow-hidden rounded-3xl border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full min-h-[300px]" />

      {/* Top Left Navigation Mode Tag */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 rounded-2xl bg-slate-900/90 px-3.5 py-2 text-white shadow-lg backdrop-blur">
        <Navigation className="h-4 w-4 text-blue-400 animate-pulse" />
        <span className="text-xs font-black tracking-wide uppercase">
          {isHeadingToCustomer ? "Navigation: To Customer" : "Navigation: To Restaurant"}
        </span>
      </div>

      {/* Bottom Right Google Maps Launcher */}
      <button
        onClick={handleOpenGoogleMaps}
        className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 text-xs font-black text-blue-600 shadow-xl backdrop-blur border border-blue-100 hover:bg-blue-50 transition active:scale-95"
      >
        <ExternalLink className="h-4 w-4" />
        <span>Open in Google Maps 🧭</span>
      </button>
    </div>
  );
}
