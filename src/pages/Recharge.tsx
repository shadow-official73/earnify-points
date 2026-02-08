import { useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { Smartphone, Zap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Recharge = () => {
  const { state, doRecharge } = useApp();
  const lang = state.language;
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState("");

  const handleRecharge = () => {
    const cleaned = mobileNumber.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast({ title: t(lang, "enterNumber"), variant: "destructive" });
      return;
    }
    if (state.points < 28) {
      toast({ title: t(lang, "insufficientPoints"), variant: "destructive" });
      return;
    }
    const success = doRecharge(cleaned);
    if (success) {
      toast({ title: t(lang, "rechargeSuccess") });
      setMobileNumber("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wider mb-4">
          {t(lang, "mobileRecharge").toUpperCase()}
        </h2>

        {/* Current Points */}
        <div className="p-4 rounded-xl bg-card border border-border/50 mb-4 flex items-center justify-between" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">{t(lang, "currentPoints")}</span>
          </div>
          <span className="font-display text-2xl font-bold text-foreground">{state.points}</span>
        </div>

        {/* Recharge Card */}
        <div className="p-5 rounded-xl bg-card border border-border/50 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{t(lang, "mobileRecharge")}</p>
              <p className="text-xs text-muted-foreground">{t(lang, "pointsRequired")}</p>
            </div>
          </div>

          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder={t(lang, "enterNumber")}
            maxLength={15}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none focus:border-primary mb-4 placeholder:text-muted-foreground"
          />

          <button
            onClick={handleRecharge}
            disabled={state.points < 28 || mobileNumber.replace(/\D/g, "").length < 10}
            className={`w-full py-3 rounded-lg font-display font-bold text-sm transition-all ${
              state.points >= 28
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {t(lang, "rechargeNow")} (28 {t(lang, "pts")})
          </button>
        </div>

        {/* Recharge History */}
        <h3 className="font-display text-sm font-semibold text-foreground tracking-wider mb-3">
          {t(lang, "rechargeHistory").toUpperCase()}
        </h3>
        {state.rechargeHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t(lang, "noHistory")}</p>
        ) : (
          <div className="space-y-2">
            {state.rechargeHistory.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{rec.number}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(rec.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-display font-bold text-destructive">-{rec.points}</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Recharge;
