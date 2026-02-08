import { Zap } from "lucide-react";

interface PointDisplayProps {
  points: number;
  miningRate: number;
}

const PointDisplay = ({ points, miningRate }: PointDisplayProps) => {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {miningRate} pts / tap
        </span>
      </div>
      <div className="relative">
        <p className="font-display text-5xl font-black text-foreground tracking-tight">
          {points.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Total Points</p>
      </div>
    </div>
  );
};

export default PointDisplay;
