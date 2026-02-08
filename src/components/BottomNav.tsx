import { Home, User, Smartphone, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();
  const lang = state.language;

  const navItems = [
    { icon: Home, label: t(lang, "home"), path: "/" },
    { icon: Smartphone, label: t(lang, "recharge"), path: "/recharge" },
    { icon: User, label: t(lang, "profile"), path: "/profile" },
    { icon: Settings, label: t(lang, "settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-topbar border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
