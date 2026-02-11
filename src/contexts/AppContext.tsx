import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { type Language } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, addRechargeRecord, getRechargeHistory } from "@/lib/firebase";

const SECONDS_PER_POINT = 86400;

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
  banned: boolean;
}

interface AppContextType {
  state: AppState;
  displaySeconds: number;
  startMining: () => void;
  stopMining: () => void;
  updateProfile: (name: string, avatar: string | null) => void;
  setLanguage: (lang: Language) => void;
  doRecharge: (number: string) => Promise<boolean>;
  loadingData: boolean;
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
  banned: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load user data from Firestore
  useEffect(() => {
    if (!user) {
      setState(defaultState);
      setLoadingData(false);
      return;
    }
    const load = async () => {
      setLoadingData(true);
      try {
        const profile = await getUserProfile(user.uid);
        const recharges = await getRechargeHistory(user.uid);
        if (profile) {
          setState({
            points: profile.points || 0,
            miningActive: profile.miningActive || false,
            miningSecondsToday: profile.miningSecondsToday || 0,
            pointsAwardedToday: profile.pointsAwardedToday || 0,
            lastResetDate: profile.lastResetDate || getToday(),
            miningStartTimestamp: profile.miningStartTimestamp || null,
            profile: { name: profile.name || "User", avatar: profile.avatar || null },
            language: profile.language || "en",
            rechargeHistory: recharges,
            daysActive: profile.daysActive || 1,
            firstUseDate: profile.firstUseDate || getToday(),
            banned: profile.banned || false,
          });
        }
      } catch (err) {
        console.error("Load data error:", err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [user]);

  // Save state to Firestore on change (debounced)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || loadingData) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateUserProfile(user.uid, {
        points: state.points,
        miningActive: state.miningActive,
        miningSecondsToday: state.miningSecondsToday,
        pointsAwardedToday: state.pointsAwardedToday,
        lastResetDate: state.lastResetDate,
        miningStartTimestamp: state.miningStartTimestamp,
        name: state.profile.name,
        avatar: state.profile.avatar,
        language: state.language,
        daysActive: state.daysActive,
        firstUseDate: state.firstUseDate,
      }).catch(console.error);
    }, 2000);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [state, user, loadingData]);

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
            return { ...resetState, points: resetState.points + pointsDiff, pointsAwardedToday: newPointsToday };
          }
          return resetState;
        });
        setState((prev) => {
          if (prev.miningActive && prev.miningStartTimestamp) {
            const elapsed = Math.floor((Date.now() - prev.miningStartTimestamp) / 1000);
            setDisplaySeconds(prev.miningSecondsToday + elapsed);
          }
          return prev;
        });
      }, 1000);
      const elapsed = Math.floor((Date.now() - state.miningStartTimestamp) / 1000);
      setDisplaySeconds(state.miningSecondsToday + elapsed);
    } else {
      setDisplaySeconds(state.miningSecondsToday);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.miningActive, state.miningStartTimestamp, checkDailyReset]);

  useEffect(() => {
    setState((prev) => checkDailyReset(prev));
  }, [checkDailyReset]);

  const startMining = useCallback(() => {
    setState((prev) => ({ ...prev, miningActive: true, miningStartTimestamp: Date.now() }));
  }, []);

  const stopMining = useCallback(() => {
    setState((prev) => {
      if (!prev.miningStartTimestamp) return { ...prev, miningActive: false };
      const elapsed = Math.floor((Date.now() - prev.miningStartTimestamp) / 1000);
      return { ...prev, miningActive: false, miningSecondsToday: prev.miningSecondsToday + elapsed, miningStartTimestamp: null };
    });
  }, []);

  const updateProfileFn = useCallback((name: string, avatar: string | null) => {
    setState((prev) => ({ ...prev, profile: { name, avatar } }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setState((prev) => ({ ...prev, language: lang }));
  }, []);

  const doRecharge = useCallback(async (number: string): Promise<boolean> => {
    if (state.points < 28 || !user) return false;
    setState((prev) => ({
      ...prev,
      points: prev.points - 28,
      rechargeHistory: [{ date: new Date().toISOString(), number, points: 28 }, ...prev.rechargeHistory],
    }));
    try {
      await addRechargeRecord(user.uid, number, 28);
    } catch (err) {
      console.error("Recharge save error:", err);
    }
    return true;
  }, [state.points, user]);

  return (
    <AppContext.Provider
      value={{ state, displaySeconds, startMining, stopMining, updateProfile: updateProfileFn, setLanguage, doRecharge, loadingData }}
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
