import rajvirLogo from "@/assets/rajvir-logo.png";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";

const MiningButton = () => {
  const { state, startMining, stopMining } = useApp();
  const isMining = state.miningActive;
  const lang = state.language;

  const handleTap = () => {
    if (isMining) {
      stopMining();
    } else {
      startMining();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {/* Glow ring */}
        {isMining && <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />}

        {/* Outer ring */}
        <div
          className={`relative w-48 h-48 rounded-full p-1 bg-gradient-to-br from-primary/40 to-primary/10 ${
            isMining ? "animate-pulse-glow" : ""
          }`}
        >
          {/* Inner ring */}
          <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-primary/20 to-transparent">
            {/* Button */}
            <button
              onClick={handleTap}
              className={`
                relative w-full h-full rounded-full
                bg-gradient-to-br from-secondary to-background
                border-2 ${isMining ? "border-primary/60" : "border-primary/30"}
                flex items-center justify-center
                transition-transform duration-150 ease-out
                active:scale-95 select-none
              `}
            >
              <img
                src={rajvirLogo}
                alt="Mine"
                className={`w-24 h-24 rounded-full pointer-events-none ${isMining ? "animate-float" : ""}`}
                draggable={false}
              />
            </button>
          </div>
        </div>
      </div>

      <p className={`mt-6 text-sm font-medium ${isMining ? "text-primary" : "text-muted-foreground"}`}>
        {isMining ? t(lang, "miningActive") : t(lang, "miningInactive")}
      </p>
      <button
        onClick={handleTap}
        className={`mt-2 px-6 py-2 rounded-full text-sm font-display font-bold transition-all ${
          isMining
            ? "bg-destructive/20 text-destructive border border-destructive/30"
            : "bg-primary/20 text-primary border border-primary/30"
        }`}
      >
        {isMining ? t(lang, "stopMining") : t(lang, "startMining")}
      </button>
    </div>
  );
};

export default MiningButton;
