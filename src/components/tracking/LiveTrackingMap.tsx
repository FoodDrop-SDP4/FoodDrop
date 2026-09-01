"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface LiveTrackingMapProps {
  restaurantName: string;
  deliveryAddress: string;
  progressPercent: number; // 0 to 100
  status: string;
}

// Preset Dhaka locations for realistic navigation simulation
const DHAKA_LOCATIONS = {
  restaurant: [23.7465, 90.3760] as [number, number], // Dhanmondi 27
  destination: [23.7937, 90.4043] as [number, number], // Banani / Gulshan
};

// Generate realistic polyline route waypoints between start and end
function generateRouteWaypoints(
  start: [number, number],
  end: [number, number],
  steps = 20
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Slight curve to simulate real city road paths
    const curveOffset = Math.sin(t * Math.PI) * 0.008;
    const lat = start[0] + (end[0] - start[0]) * t + curveOffset;
    const lng = start[1] + (end[1] - start[1]) * t + curveOffset * 0.5;
    points.push([lat, lng]);
  }
  return points;
}

export default function LiveTrackingMap({
  restaurantName,
  deliveryAddress,
  progressPercent,
  status,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);

  const startCoord = DHAKA_LOCATIONS.restaurant;
  const endCoord = DHAKA_LOCATIONS.destination;
  const routePoints = generateRouteWaypoints(startCoord, endCoord, 30);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [23.7701, 90.3901],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap standard clean tiles (No API key watermark)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // 1. Restaurant Icon Marker
    const restaurantIcon = L.divIcon({
      className: "custom-restaurant-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></div>
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/40 border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
              <path d="M2 7h20"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(startCoord, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`<b>${restaurantName}</b><br/>Food Pickup Point`);

    // 2. Customer Home Marker
    const homeIcon = L.divIcon({
      className: "custom-home-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(endCoord, { icon: homeIcon })
      .addTo(map)
      .bindPopup(`<b>Delivery Address</b><br/>${deliveryAddress}`);

    // 3. Route Polyline
    L.polyline(routePoints, {
      color: "#ea580c",
      weight: 5,
      opacity: 0.8,
      dashArray: "8, 8",
    }).addTo(map);

    // 4. Moving Rider Marker (Only visible when rider is assigned or on the way)
    const showRiderMarker = status === "ACCEPTED_BY_RIDER" || status === "ON_THE_WAY" || status === "DELIVERED";

    if (showRiderMarker) {
      const riderIcon = L.divIcon({
        className: "custom-rider-marker",
        html: `
          <div class="relative flex items-center justify-center transition-transform duration-300">
            <div class="absolute -inset-3 rounded-full bg-emerald-500/30 animate-pulse"></div>
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-600/50 border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="15" cy="5" r="1"/>
                <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const riderMarker = L.marker(startCoord, { icon: riderIcon, zIndexOffset: 1000 }).addTo(map);
      riderMarker.bindPopup("<b>Rider on the Move 🏍️</b><br/>Heading with your order");
      riderMarkerRef.current = riderMarker;
    }

    // Fit map bounds to encompass both endpoints
    const bounds = L.latLngBounds([startCoord, endCoord]);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [restaurantName, deliveryAddress, status]);

  // Update Rider position smoothly along route based on progress percentage
  useEffect(() => {
    if (!riderMarkerRef.current) return;

    // Calculate current point along the route
    const clampedProgress = Math.max(0, Math.min(100, progressPercent));
    const index = Math.min(
      routePoints.length - 1,
      Math.floor((clampedProgress / 100) * (routePoints.length - 1))
    );

    const currentCoord = routePoints[index];
    riderMarkerRef.current.setLatLng(currentCoord);
  }, [progressPercent]);

  return (
    <div className="relative z-0 h-full w-full min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-3xl border border-slate-200/80 shadow-inner [isolation:isolate]">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Map Status Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur border border-slate-100">
        <div className="flex h-3 w-3 items-center justify-center">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
          {status === "PENDING"
            ? "Waiting for Kitchen"
            : status === "PREPARING"
            ? "Cooking in Kitchen"
            : status === "READY_FOR_PICKUP"
            ? "Food Ready for Pickup"
            : status === "ACCEPTED_BY_RIDER"
            ? "Rider Assigned"
            : status === "ON_THE_WAY"
            ? "Rider Out for Delivery"
            : "Live GPS Tracking"}
        </span>
      </div>
    </div>
  );
}
