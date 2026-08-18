import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FoodDrop - Food Delivery & Restaurant Platform",
    short_name: "FoodDrop",
    description: "Fastest Food Delivery, Restaurant & Rider Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ea580c",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Order Food",
        short_name: "Order",
        description: "Browse restaurants and order food",
        url: "/",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "My Orders",
        short_name: "Orders",
        description: "Track your live food orders",
        url: "/orders",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Kitchen Dashboard",
        short_name: "Kitchen",
        description: "Restaurant owner live order manager",
        url: "/restaurant",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Rider Dashboard",
        short_name: "Rider",
        description: "Rider delivery navigation and trips",
        url: "/rider",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
