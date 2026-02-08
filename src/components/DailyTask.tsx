import { CheckCircle2, Circle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
}

interface DailyTaskProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const DailyTask = ({ tasks, onComplete }: DailyTaskProps) => {
  return (
    <div className="px-4 pb-24">
      <h2 className="font-display text-sm font-semibold text-foreground tracking-wider mb-3">
        DAILY TASKS
      </h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => !task.completed && onComplete(task.id)}
            disabled={task.completed}
            className={`
              w-full flex items-center justify-between p-4 rounded-xl border transition-all
              ${
                task.completed
                  ? "bg-card/50 border-border/30 opacity-60"
                  : "bg-card border-border/50 hover:border-primary/30 active:scale-[0.98]"
              }
            `}
          >
            <div className="flex items-center gap-3">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              <span
                className={`text-sm font-medium ${
                  task.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {task.title}
              </span>
            </div>
            <span className="text-sm font-display font-bold text-primary">
              +{task.reward}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyTask;
