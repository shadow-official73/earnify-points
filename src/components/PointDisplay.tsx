import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const PointDisplay = () => {
  const { state } = useApp();

  return (
    <div className="text-center py-6">
      <div className="relative">
        <p className="font-display text-5xl font-black text-foreground tracking-tight">
          {state.points.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {t(state.language, "totalPoints")}
        </p>
      </div>
    </div>
  );
};

export default PointDisplay;
