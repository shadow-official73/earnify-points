import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { type Language } from "@/lib/translations";

const SECONDS_PER_POINT = 18000; // 5 hours

interface RechargeRecord {
  date: string;
  number: string;
  points: number;
}

interface AppState {
  points: number;
  miningActive: boolean;
  miningSecondsToday: number;
  pointsAwardedToday: number;
  lastResetDate: string;
  miningStartTimestamp: number | null;
  profile: {
    name: string;
    avatar: string | null;
  };
  language: Language;
  rechargeHistory: RechargeRecord[];
  daysActive: number;
  firstUseDate: string;
}

interface AppContextType {
  state: AppState;
  displaySeconds: number;
  startMining: () => void;
  stopMining: () => void;
  updateProfile: (name: string, avatar: string | null) => void;
  setLanguage: (lang: Language) => void;
  doRecharge: (number: string) => boolean;
}

const getToday = () => new Date().toISOString().split("T")[0];

const defaultState: AppState = {
  points: 0,
  miningActive: false,
  miningSecondsToday: 0,
  pointsAwardedToday: 0,
  lastResetDate: getToday(),
  miningStartTimestamp: null,
  profile: { name: "User", avatar: null },
  language: "en",
  rechargeHistory: [],
  daysActive: 1,
  firstUseDate: getToday(),
};

function loadState(): AppState {
  try {
    const saved = localStorage.getItem("rajvir_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return { ...defaultState };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem("rajvir_state", JSON.stringify(state));
  } catch {}
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check daily reset
  const checkDailyReset = useCallback((s: AppState): AppState => {
    const today = getToday();
    if (s.lastResetDate !== today) {
      const daysDiff = Math.max(1, Math.floor((Date.now() - new Date(s.firstUseDate).getTime()) / 86400000) + 1);
      return {
        ...s,
        miningSecondsToday: 0,
        pointsAwardedToday: 0,
        lastResetDate: today,
        miningActive: false,
        miningStartTimestamp: null,
        daysActive: daysDiff,
      };
    }
    return s;
  }, []);

  // Save state on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Mining tick
  useEffect(() => {
    if (state.miningActive && state.miningStartTimestamp) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const resetState = checkDailyReset(prev);
          if (!resetState.miningActive || !resetState.miningStartTimestamp) return resetState;

          const elapsed = Math.floor((Date.now() - resetState.miningStartTimestamp) / 1000);
          const totalSeconds = resetState.miningSecondsToday + elapsed;
          const newPointsToday = Math.floor(totalSeconds / SECONDS_PER_POINT);
          const pointsDiff = newPointsToday - resetState.pointsAwardedToday;

          if (pointsDiff > 0) {
            return {
              ...resetState,
              points: resetState.points + pointsDiff,
              pointsAwardedToday: newPointsToday,
            };
          }
          return resetState;
        });

        // Update display seconds
        setState((prev) => {
          if (prev.miningActive && prev.miningStartTimestamp) {
            const elapsed = Math.floor((Date.now() - prev.miningStartTimestamp) / 1000);
            setDisplaySeconds(prev.miningSecondsToday + elapsed);
          }
          return prev;
        });
      }, 1000);

      // Set initial display
      const elapsed = Math.floor((Date.now() - state.miningStartTimestamp) / 1000);
      setDisplaySeconds(state.miningSecondsToday + elapsed);
    } else {
      setDisplaySeconds(state.miningSecondsToday);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.miningActive, state.miningStartTimestamp, checkDailyReset]);

  // Check reset on mount
  useEffect(() => {
    setState((prev) => checkDailyReset(prev));
  }, [checkDailyReset]);

  const startMining = useCallback(() => {
    setState((prev) => ({
      ...prev,
      miningActive: true,
      miningStartTimestamp: Date.now(),
    }));
  }, []);

  const stopMining = useCallback(() => {
    setState((prev) => {
      if (!prev.miningStartTimestamp) return { ...prev, miningActive: false };
      const elapsed = Math.floor((Date.now() - prev.miningStartTimestamp) / 1000);
      return {
        ...prev,
        miningActive: false,
        miningSecondsToday: prev.miningSecondsToday + elapsed,
        miningStartTimestamp: null,
      };
    });
  }, []);

  const updateProfile = useCallback((name: string, avatar: string | null) => {
    setState((prev) => ({
      ...prev,
      profile: { name, avatar },
    }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState((prev) => ({ ...prev, language: lang }));
  }, []);

  const doRecharge = useCallback((number: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.points < 28) return prev;
      success = true;
      return {
        ...prev,
        points: prev.points - 28,
        rechargeHistory: [
          { date: new Date().toISOString(), number, points: 28 },
          ...prev.rechargeHistory,
        ],
      };
    });
    return success;
  }, []);

  return (
    <AppContext.Provider
      value={{ state, displaySeconds, startMining, stopMining, updateProfile, setLanguage, doRecharge }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
