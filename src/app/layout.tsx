import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "../components/common/Navbar";
import CartDrawer from "../components/common/CartDrawer";
import FoodieAIAssistant from "../components/ai/FoodieAIAssistant";
import { LanguageProvider } from "../lib/i18n/LanguageContext";

export const metadata = {
	title: "FoodDrop - Online Food Delivery",
	description: "Premium food delivery platform connecting customers, restaurants, and delivery riders",
};

type RootLayoutProps = {
	children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body className="bg-white text-slate-950 antialiased">
				<LanguageProvider>
					<Navbar />
					<CartDrawer />
					{children}
					<FoodieAIAssistant />
				</LanguageProvider>
			</body>
		</html>
	);
}
