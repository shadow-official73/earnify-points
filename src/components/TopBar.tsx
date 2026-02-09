import rajvirLogo from "@/assets/rajvir-logo.png";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-topbar border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <img
            src={rajvirLogo}
            alt="RAJVIR"
            className="w-9 h-9 rounded-full"
          />
          <h1 className="font-display text-xl font-bold tracking-wider text-primary">
            RAJVIR
          </h1>
        </div>
        <div className="flex items-center gap-2" />
      </div>
    </header>
  );
};

export default TopBar;
