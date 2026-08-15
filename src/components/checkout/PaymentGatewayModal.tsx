"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { triggerFireworks } from "../../lib/confetti";

export type PaymentGatewayType = "BKASH" | "NAGAD" | "CARD";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string, method: PaymentGatewayType) => void;
  amount: number;
  paymentMethod: PaymentGatewayType;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  paymentMethod,
}: PaymentGatewayModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [walletNumber, setWalletNumber] = useState("017");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(30);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Countdown timer for OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const isBkash = paymentMethod === "BKASH";
  const isNagad = paymentMethod === "NAGAD";
  const isCard = paymentMethod === "CARD";

  const brandName = isBkash ? "bKash" : isNagad ? "Nagad" : "Debit / Credit Card";
  const brandColor = isBkash
    ? "bg-[#E2136E]"
    : isNagad
    ? "bg-gradient-to-r from-[#F7931E] to-[#E61C24]"
    : "bg-slate-900";

  const brandButtonColor = isBkash
    ? "bg-[#E2136E] hover:bg-[#c90f61]"
    : isNagad
    ? "bg-[#F7931E] hover:bg-[#df8014]"
    : "bg-slate-900 hover:bg-slate-800";

  // Step 1: Submit Phone / Card
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCard) {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        alert("Please fill all card details.");
        return;
      }
    } else {
      if (walletNumber.length < 11) {
        alert(`Please enter a valid 11-digit ${brandName} account number.`);
        return;
      }
      if (!agreed) {
        alert("Please agree to the terms and conditions.");
        return;
      }
    }
    setTimer(30);
    setStep(2);
  };

  // Step 2: Submit OTP
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert("Please enter the verification code (Use 123456 for demo).");
      return;
    }
    setStep(3);
  };

  // Step 3: Submit PIN & Finalize Payment
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      alert("Please enter your 5-digit PIN (Use 12345 for demo).");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
      triggerFireworks();

      const trxId = `TRX-${isBkash ? "BK" : isNagad ? "NG" : "CR"}-${Math.floor(
        1000000 + Math.random() * 9000000
      )}`;

      setTimeout(() => {
        onSuccess(trxId, paymentMethod);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-slate-100">
        
        {/* Gateway Brand Header */}
        <div className={`${brandColor} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-md">
                {isCard ? (
                  <CreditCard className="h-6 w-6 text-slate-900" />
                ) : (
                  <Smartphone className={`h-6 w-6 ${isBkash ? "text-[#E2136E]" : "text-[#F7931E]"}`} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black">{brandName} Payment</h3>
                <p className="text-xs text-white/80">Merchant: FoodDrop BD</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 block">
                Amount
              </span>
              <span className="text-2xl font-black">৳{amount}</span>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Account Number / Card Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              {!isCard ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Your {brandName} Account Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        maxLength={11}
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition"
                        autoFocus
                      />
                      <Smartphone className="absolute right-4 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Enter the 11-digit personal account number.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>I agree to the terms and conditions</span>
                  </label>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg transition active:scale-95 ${brandButtonColor}`}
              >
                Proceed to Verification
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification Code */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-base font-black text-slate-900">Enter Verification Code</h4>
                <p className="text-xs text-slate-500">
                  A 6-digit OTP has been simulated for {walletNumber || "your account"}.
                </p>
                <div className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 mt-2">
                  Demo Hint: Enter <b>123456</b>
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[1em] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-lg font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Didn't receive code?</span>
                {timer > 0 ? (
                  <span className="font-bold text-orange-600">{timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTimer(30)}
                    className="font-bold text-orange-600 hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl bg-slate-100 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`rounded-2xl py-3.5 text-xs font-black uppercase text-white shadow transition active:scale-95 ${brandButtonColor}`}
                >
                  Verify Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Secret PIN */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Lock className="h-6 w-6" />
                </div>
                <h4 className="text-base font-black text-slate-900">Enter Your Secret PIN</h4>
                <p className="text-xs text-slate-500">
                  Secured by 256-bit simulated financial encryption.
                </p>
                <div className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 mt-2">
                  Demo Hint: Enter <b>12345</b>
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full text-center tracking-[1em] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xl font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full rounded-2xl py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl transition active:scale-95 disabled:opacity-60 ${brandButtonColor}`}
              >
                {isProcessing ? "Authorizing Payment..." : `Confirm Payment ৳${amount}`}
              </button>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  ৳{amount} paid via {brandName}. Placing your order now...
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Simulated PCI-DSS Level 1 Secure Gateway</span>
        </div>

      </div>
    </div>
  );
}
