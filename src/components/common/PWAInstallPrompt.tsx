"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Sparkles, Store, Bike, Utensils, Check } from "lucide-react";
import { User } from "../../types";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running standalone
    const isAppStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isAppStandalone);

    // 2. Check if dismissed previously in session
    const dismissed = sessionStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Sync User role from localStorage to personalize message
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // quiet
      }
    }

    // 5. Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA: Service Worker registered successfully!", reg.scope);
          })
          .catch((err) => {
            console.warn("PWA: Service Worker registration error:", err);
          });
      });
    }

    // 6. Listen for beforeinstallprompt event (Android, Chrome, Edge, Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 7. Listen for appinstalled event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsDismissed(true), 3000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already in standalone app mode or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show if deferredPrompt is available OR if on mobile iOS browser
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  // Role-based custom text
  const isOwner = user?.role === "RESTAURANT_OWNER";
  const isRider = user?.role === "RIDER";

  const appTitle = isOwner
    ? "FoodDrop Kitchen Manager"
    : isRider
    ? "FoodDrop Rider Partner"
    : "FoodDrop Fast Delivery";

  const appDescription = isOwner
    ? "Install app for instant kitchen bell alerts & live order management."
    : isRider
    ? "Install app for full-screen turn-by-turn GPS navigation & rapid trips."
    : "Install app on your phone for 1-tap food ordering & live GPS tracking.";

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans">
        <div className="flex items-center justify-between gap-3.5 rounded-3xl border border-orange-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
          
          {/* App Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20">
            {isOwner ? (
              <Store className="h-6 w-6" />
            ) : isRider ? (
              <Bike className="h-6 w-6" />
            ) : (
              <Utensils className="h-6 w-6" />
            )}
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-slate-900 text-sm truncate">{appTitle}</h4>
              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
              {appDescription}
            </p>
          </div>

          {/* Install CTA Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isInstalled ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-200">
                <Check className="h-4 w-4" /> Installed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-95 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              title="Close"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Safari Share Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Smartphone className="h-7 w-7" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">Install on iOS (iPhone / iPad)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Follow these simple steps in Safari to add FoodDrop to your home screen:
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-left space-y-2.5 text-xs text-slate-700 font-medium">
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-black text-[10px]">1</span>
                <span>Tap the <b>Share button</b> (box with arrow at bottom).</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-black text-[10px]">2</span>
                <span>Scroll down and tap <b>'Add to Home Screen'</b>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-black text-[10px]">3</span>
                <span>Tap <b>'Add'</b> on top right to launch full-screen!</span>
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Got it! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}
