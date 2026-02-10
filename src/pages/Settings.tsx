import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/contexts/AppContext";
import { t, languageNames, type Language } from "@/lib/translations";
import { Globe, Lock, LogOut, ChevronRight, HelpCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const LANGUAGES: Language[] = ["en", "hi", "pa", "es", "fr"];

const Settings = () => {
  const { state, setLanguage } = useApp();
  const lang = state.language;
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChangePassword = () => {
    toast({ title: t(lang, "loginRequired"), variant: "destructive" });
  };

  const handleLogout = () => {
    toast({ title: t(lang, "loginRequired"), variant: "destructive" });
  };

  const faqs = [
    { q: t(lang, "helpQ1"), a: t(lang, "helpA1") },
    { q: t(lang, "helpQ2"), a: t(lang, "helpA2") },
    { q: t(lang, "helpQ3"), a: t(lang, "helpA3") },
    { q: t(lang, "helpQ4"), a: t(lang, "helpA4") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wider mb-4">
          {t(lang, "settings").toUpperCase()}
        </h2>

        {/* Language */}
        <div className="p-4 rounded-xl bg-card border border-border/50 mb-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{t(lang, "language")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  state.language === l
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "bg-secondary text-muted-foreground border border-border/50 hover:text-foreground"
                }`}
              >
                {languageNames[l]}
              </button>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <button
          onClick={handleChangePassword}
          className="w-full p-4 rounded-xl bg-card border border-border/50 mb-3 flex items-center justify-between"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t(lang, "changePassword")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full p-4 rounded-xl bg-card border border-border/50 flex items-center justify-between"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">{t(lang, "logout")}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </main>
      <BottomNav />
    </div>
  );
};

export default Settings;
