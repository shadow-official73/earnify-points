import { useState, useCallback } from "react";
import rajvirLogo from "@/assets/rajvir-logo.png";

interface FloatingPoint {
  id: number;
  x: number;
  y: number;
  value: number;
}

interface MiningButtonProps {
  onMine: () => void;
  miningRate: number;
}

const MiningButton = ({ onMine, miningRate }: MiningButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([]);

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      onMine();
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      // Get position for floating point
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.left + rect.width / 2 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.top : e.clientY;

      const newPoint: FloatingPoint = {
        id: Date.now() + Math.random(),
        x: clientX - rect.left,
        y: clientY - rect.top,
        value: miningRate,
      };

      setFloatingPoints((prev) => [...prev, newPoint]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((p) => p.id !== newPoint.id));
      }, 800);
    },
    [onMine, miningRate]
  );

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />

        {/* Outer ring */}
        <div className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-br from-primary/40 to-primary/10 animate-pulse-glow">
          {/* Inner ring */}
          <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-primary/20 to-transparent">
            {/* Button */}
            <button
              onClick={handleTap}
              className={`
                relative w-full h-full rounded-full
                bg-gradient-to-br from-secondary to-background
                border-2 border-primary/30
                flex items-center justify-center
                transition-transform duration-150 ease-out
                active:scale-95 select-none
                ${isPressed ? "scale-95" : "scale-100"}
              `}
            >
              <img
                src={rajvirLogo}
                alt="Mine"
                className="w-24 h-24 rounded-full animate-float pointer-events-none"
                draggable={false}
              />
            </button>
          </div>
        </div>

        {/* Floating points */}
        {floatingPoints.map((fp) => (
          <span
            key={fp.id}
            className="absolute font-display text-lg font-bold text-primary animate-point-pop pointer-events-none"
            style={{ left: fp.x, top: fp.y }}
          >
            +{fp.value}
          </span>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground font-medium">Tap to mine points</p>
    </div>
  );
};

export default MiningButton;
