import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { Clock } from "lucide-react";

const SECONDS_PER_POINT = 86400; // 1 point per 24 hours (~1 pt/day)

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const MiningProgress = () => {
  const { state, displaySeconds } = useApp();
  const lang = state.language;

  const secondsToNextPoint = SECONDS_PER_POINT - (displaySeconds % SECONDS_PER_POINT);
  const progressPercent = ((displaySeconds % SECONDS_PER_POINT) / SECONDS_PER_POINT) * 100;
  const earnedToday = Math.floor(displaySeconds / SECONDS_PER_POINT);

  return (
    <div className="px-4 space-y-4">
      {/* Time mined today */}
      <div className="p-4 rounded-xl bg-card border border-border/50" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">{t(lang, "timeToday")}</span>
          </div>
          <span className="font-display text-sm font-bold text-foreground">{formatTime(displaySeconds)}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">
            {t(lang, "nextPointIn")} {formatTime(secondsToNextPoint)}
          </span>
          <span className="text-[10px] text-muted-foreground">{t(lang, "pointsPerDay")}</span>
        </div>
      </div>

    </div>
  );
};

export default MiningProgress;
