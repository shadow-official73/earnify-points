import TopBar from "@/components/TopBar";
import PointDisplay from "@/components/PointDisplay";
import MiningButton from "@/components/MiningButton";
import BottomNav from "@/components/BottomNav";
import MiningProgress from "@/components/MiningProgress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20">
        <PointDisplay />
        <MiningButton />
        <MiningProgress />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
