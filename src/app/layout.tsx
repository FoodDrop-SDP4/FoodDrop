import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import CartDrawer from "../components/common/CartDrawer";
import FoodieAIAssistant from "../components/ai/FoodieAIAssistant";

export const metadata = {
	title: "FoodDrop",
	description: "Premium food delivery platform",
};

type RootLayoutProps = {
	children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body className="bg-white text-slate-950 antialiased">
				<Navbar />
				<CartDrawer />
				{children}
				<FoodieAIAssistant />
			</body>
		</html>
	);
}
