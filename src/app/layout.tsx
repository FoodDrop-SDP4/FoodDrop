import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import CartDrawer from "../components/common/CartDrawer";
import FoodieAIAssistant from "../components/ai/FoodieAIAssistant";
import PWAInstallPrompt from "../components/common/PWAInstallPrompt";
import LiveCustomerDeliveryPrompt from "../components/orders/LiveCustomerDeliveryPrompt";

export const metadata: Metadata = {
	title: "FoodDrop - Fast Food & Delivery Platform",
	description: "Premium food delivery and restaurant management platform",
	applicationName: "FoodDrop",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "FoodDrop",
	},
	formatDetection: {
		telephone: false,
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#ea580c",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

type RootLayoutProps = {
	children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<head>
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="theme-color" content="#ea580c" />
			</head>
			<body className="bg-white text-slate-950 antialiased font-sans">
				<Navbar />
				<CartDrawer />
				{children}
				<FoodieAIAssistant />
				<PWAInstallPrompt />
				<LiveCustomerDeliveryPrompt />
			</body>
		</html>
	);
}

