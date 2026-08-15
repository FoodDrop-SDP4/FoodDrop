"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Trash2, Home, Briefcase, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Address } from "../../../types";

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [label, setLabel] = useState("Home");
  const [fullAddress, setFullAddress] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const router = useRouter();

  const fetchAddresses = async () => {
    let currentUser: any = null;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (e) {
        currentUser = null;
      }
    }

    if (!currentUser) {
      try {
        const authRes = await fetch("/api/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            currentUser = authData.user;
            localStorage.setItem("user", JSON.stringify(authData.user));
          }
        }
      } catch (e) {
        // quiet
      }
    }

    if (!currentUser?.id) {
      setIsLoading(false);
      router.push("/login?redirect=/profile/addresses");
      return;
    }

    try {
      const res = await fetch(`/api/users/addresses?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [router]);

const handleAddAddress = async (e: React.FormEvent) => {
  e.preventDefault();
  const storedUser = localStorage.getItem("user");
  if (!storedUser) {
    alert("Please sign in first!");
    return;
  }

  const user = JSON.parse(storedUser);
  const userId = user.id || user._id;

  if (!userId) {
    alert("User ID missing! Please log out and sign in again.");
    return;
  }

  setIsSubmitting(true);
  try {
    const res = await fetch("/api/users/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        label,
        address: fullAddress,
      }),
    });

    // 🚀 HTML Error Page দিলে জেসন পার্স ক্র্যাশ রোধ করা
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await res.text();
      console.error("Server HTML Error Response:", textError);
      alert(`Server Route Error (${res.status})! Check console for HTML response.`);
      return;
    }

    const data = await res.json();

    if (res.ok) {
      setFullAddress("");
      setShowAddForm(false);
      fetchAddresses();
      alert("Address saved successfully!");
    } else {
      alert(`Error: ${data.message || "Failed to save address"}`);
    }
  } catch (err: any) {
    console.error("Fetch Catch Error:", err);
    alert("Network or Parsing error while saving address!");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/users/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Saved Addresses</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your home, office, and delivery locations</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
          >
            <Plus className="h-4 w-4" /> Add New Address
          </button>
        </div>

        {/* Add New Address Form Modal/Dropdown */}
        {showAddForm && (
          <form onSubmit={handleAddAddress} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Delivery Location</h3>

            <div className="flex gap-3">
              {["Home", "Office", "Other"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setLabel(item)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    label === item
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item === "Home" && <Home className="h-3.5 w-3.5" />}
                  {item === "Office" && <Briefcase className="h-3.5 w-3.5" />}
                  {item === "Other" && <MapPin className="h-3.5 w-3.5" />}
                  {item}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Full Address Details</label>
              <textarea
                required
                rows={3}
                placeholder="House #, Road #, Area, Landmark (e.g. House 12, Road 4, Mirpur 10, Dhaka)"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300 stroke-1" />
            <p className="font-bold text-slate-700">No saved addresses yet!</p>
            <p className="text-xs text-slate-400 mt-1">Add your addresses to speed up checkout.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 border border-orange-100">
                      {item.label === "Home" && <Home className="h-3.5 w-3.5" />}
                      {item.label === "Office" && <Briefcase className="h-3.5 w-3.5" />}
                      {item.label === "Other" && <MapPin className="h-3.5 w-3.5" />}
                      {item.label}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(item.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}