import { useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import PointDisplay from "@/components/PointDisplay";
import MiningButton from "@/components/MiningButton";
import StatsCard from "@/components/StatsCard";
import DailyTask from "@/components/DailyTask";
import BottomNav from "@/components/BottomNav";

const INITIAL_TASKS = [
  { id: "1", title: "Mine 100 points", reward: 50, completed: false },
  { id: "2", title: "Tap 50 times", reward: 30, completed: false },
  { id: "3", title: "Reach Level 2", reward: 100, completed: false },
  { id: "4", title: "Share with a friend", reward: 75, completed: false },
];

const Index = () => {
  const [points, setPoints] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const miningRate = 1 + Math.floor(totalTaps / 100);
  const level = Math.floor(points / 500) + 1;

  const handleMine = useCallback(() => {
    const rate = 1 + Math.floor(totalTaps / 100);
    setPoints((prev) => prev + rate);
    setSessionPoints((prev) => prev + rate);
    setTotalTaps((prev) => prev + 1);
  }, [totalTaps]);

  const handleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id && !task.completed) {
          setPoints((p) => p + task.reward);
          setSessionPoints((sp) => sp + task.reward);
          return { ...task, completed: true };
        }
        return task;
      })
    );
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />

      <main className="flex-1 overflow-y-auto">
        <PointDisplay points={points} miningRate={miningRate} />
        <MiningButton onMine={handleMine} miningRate={miningRate} />
        <StatsCard
          totalTaps={totalTaps}
          sessionPoints={sessionPoints}
          level={level}
        />
        <div className="mt-6">
          <DailyTask tasks={tasks} onComplete={handleTaskComplete} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
