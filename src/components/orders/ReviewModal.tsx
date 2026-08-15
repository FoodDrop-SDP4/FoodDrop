"use client";

import { useState } from "react";
import {
  X,
  Star,
  Loader2,
  Store,
  Bike,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Order } from "../../types";
import { triggerConfetti } from "../../lib/confetti";

interface ReviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RIDER_QUICK_TAGS = [
  "⚡ Super Fast Delivery",
  "😊 Polite & Friendly",
  "📦 Food Handled with Care",
  "🎯 Accurate Drop-off",
];

export default function ReviewModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  // Restaurant Rating State
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [hoverResRating, setHoverResRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState("");

  // Rider Rating State
  const [riderRating, setRiderRating] = useState(5);
  const [hoverRiderRating, setHoverRiderRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [riderComment, setRiderComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please sign in to submit a review.");
      return;
    }

    const user = JSON.parse(storedUser);
    setIsSubmitting(true);

    const fullRiderComment = [
      ...selectedTags,
      riderComment.trim(),
    ]
      .filter(Boolean)
      .join(" • ");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          restaurantId: order.restaurantId,
          rating: restaurantRating,
          comment: restaurantComment,
          riderId: order.rider?.id || order.riderId || undefined,
          riderRating: order.rider ? riderRating : undefined,
          riderComment: fullRiderComment || undefined,
        }),
      });

      if (res.ok) {
        triggerConfetti();
        alert("🎉 Thank you for rating the restaurant and delivery partner!");
        setRestaurantComment("");
        setRestaurantRating(5);
        setRiderRating(5);
        setSelectedTags([]);
        setRiderComment("");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("An error occurred while submitting your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Rate Your Experience</span>
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Order #{order.id.slice(0, 8)} • {order.restaurant?.name || "Restaurant"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. 🏪 Food & Restaurant Experience */}
          <div className="rounded-2xl bg-orange-50/50 p-5 border border-orange-100 space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
              <Store className="h-4 w-4" />
              <span>Food & Kitchen Quality ({order.restaurant?.name})</span>
            </div>

            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRestaurantRating(star)}
                    onMouseEnter={() => setHoverResRating(star)}
                    onMouseLeave={() => setHoverResRating(0)}
                    className="p-1 text-slate-200 transition hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        (hoverResRating || restaurantRating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-black text-amber-600">
                {restaurantRating === 5
                  ? "Delicious Food! 🌟"
                  : restaurantRating === 4
                  ? "Very Good Taste 👍"
                  : restaurantRating === 3
                  ? "Average 😐"
                  : restaurantRating === 2
                  ? "Poor Quality 👎"
                  : "Terrible 😡"}
              </span>
            </div>

            <div>
              <textarea
                rows={2}
                placeholder="How was the taste, packaging, and portion size? (Optional)"
                value={restaurantComment}
                onChange={(e) => setRestaurantComment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-orange-500"
              />
            </div>
          </div>

          {/* 2. 🏍️ Delivery Partner Experience */}
          {order.rider ? (
            <div className="rounded-2xl bg-blue-50/50 p-5 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <Bike className="h-4 w-4" />
                  <span>Delivery Partner ({order.rider.name})</span>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                  Rider Rating
                </span>
              </div>

              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRiderRating(star)}
                      onMouseEnter={() => setHoverRiderRating(star)}
                      onMouseLeave={() => setHoverRiderRating(0)}
                      className="p-1 text-slate-200 transition hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          (hoverRiderRating || riderRating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-blue-700">
                  {riderRating === 5
                    ? "Lightning Fast & Polite! ⚡"
                    : riderRating === 4
                    ? "Great Delivery 👍"
                    : riderRating === 3
                    ? "Average Service 😐"
                    : riderRating === 2
                    ? "Slow Delivery 👎"
                    : "Unprofessional 😡"}
                </span>
              </div>

              {/* Quick Compliment Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">
                  Quick Compliments:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {RIDER_QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-2xl bg-slate-100 py-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-2/3 items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Submit Full Review</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
