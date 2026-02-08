import { TrendingUp, Clock, Target } from "lucide-react";

interface StatsCardProps {
  totalTaps: number;
  sessionPoints: number;
  level: number;
}

const StatsCard = ({ totalTaps, sessionPoints, level }: StatsCardProps) => {
  const stats = [
    {
      icon: Target,
      label: "Total Taps",
      value: totalTaps.toLocaleString(),
    },
    {
      icon: TrendingUp,
      label: "Session",
      value: `+${sessionPoints.toLocaleString()}`,
    },
    {
      icon: Clock,
      label: "Level",
      value: level.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <stat.icon className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-foreground font-display">
            {stat.value}
          </span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
