import { Home, Users, Gift, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Users, label: "Team" },
  { icon: Gift, label: "Rewards" },
  { icon: User, label: "Profile" },
];

const BottomNav = () => {
  const [active, setActive] = useState(0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-topbar border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActive(index)}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
              ${
                active === index
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
