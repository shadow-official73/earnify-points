import { useState, useRef, useEffect } from "react";
import { setupRecaptcha, sendOTP } from "@/lib/firebase";
import { type ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import rajvirLogo from "@/assets/rajvir-logo.png";
import { Phone, Shield, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch {}
      }
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("कृपया 10 अंकों का मोबाइल नंबर दर्ज करें");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (recaptchaRef.current) {
        try { recaptchaRef.current.clear(); } catch {}
      }
      recaptchaRef.current = setupRecaptcha("recaptcha-container");
      const fullPhone = `+91${phone}`;
      const confirmation = await sendOTP(fullPhone, recaptchaRef.current);
      confirmationRef.current = confirmation;
      setStep("otp");
    } catch (err: any) {
      console.error("OTP error:", err);
      setError(err.message || "OTP भेजने में समस्या हुई");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("कृपया 6 अंकों का OTP दर्ज करें");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmationRef.current?.confirm(otp);
      // Auth state change will handle redirect
    } catch (err: any) {
      console.error("Verify error:", err);
      setError("गलत OTP, फिर से कोशिश करें");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={rajvirLogo} alt="RAJVIR" className="w-20 h-20 rounded-full mb-4" />
          <h1 className="font-display text-3xl font-bold tracking-wider text-primary">RAJVIR</h1>
          <p className="text-muted-foreground text-sm mt-2">Mining App</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border/50" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">मोबाइल नंबर दर्ज करें</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-medium text-sm bg-secondary px-3 py-3 rounded-lg border border-border">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="10 अंकों का नंबर"
                  maxLength={10}
                  className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{phone.length}/10</p>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading || phone.length !== 10}
              className={`w-full py-3 rounded-lg font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                phone.length === 10 && !loading
                  ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "OTP भेज रहे हैं..." : "OTP भेजें"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border/50" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">OTP दर्ज करें</span>
                  <p className="text-[10px] text-muted-foreground">+91{phone} पर भेजा गया</p>
                </div>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 अंकों का OTP"
                maxLength={6}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary placeholder:text-muted-foreground text-center tracking-[0.5em] text-lg"
              />
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className={`w-full py-3 rounded-lg font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                otp.length === 6 && !loading
                  ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? "Verify कर रहे हैं..." : "Verify करें"}
            </button>

            <button
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="w-full text-center text-sm text-muted-foreground hover:text-primary"
            >
              ← नंबर बदलें
            </button>
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm text-center mt-4">{error}</p>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default Login;
