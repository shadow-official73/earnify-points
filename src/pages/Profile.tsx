import { useState, useRef } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/contexts/AppContext";
import { t } from "@/lib/translations";
import { Camera, Trash2, Edit3, Award, CalendarDays, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { state, updateProfile } = useApp();
  const lang = state.language;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(state.profile.name);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile(state.profile.name, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    updateProfile(state.profile.name, null);
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed.length > 0 && trimmed.length <= 30) {
      updateProfile(trimmed, state.profile.avatar);
      setIsEditing(false);
    }
  };

  const stats = [
    { icon: Award, label: t(lang, "totalPointsStat"), value: state.points.toLocaleString() },
    { icon: CalendarDays, label: t(lang, "daysActive"), value: state.daysActive.toString() },
    { icon: Smartphone, label: t(lang, "totalRecharges"), value: state.rechargeHistory.length.toString() },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary border-2 border-primary/30 overflow-hidden flex items-center justify-center">
              {state.profile.avatar ? (
                <img src={state.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold text-primary">
                  {state.profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium flex items-center gap-1 border border-primary/30"
              >
                <Camera className="w-3 h-3" />
                {t(lang, "uploadAvatar")}
              </button>
              {state.profile.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-medium flex items-center gap-1 border border-destructive/30"
                >
                  <Trash2 className="w-3 h-3" />
                  {t(lang, "removeAvatar")}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={30}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm font-medium w-40 outline-none focus:border-primary"
              />
              <button onClick={handleSaveName} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                {t(lang, "save")}
              </button>
              <button onClick={() => { setIsEditing(false); setEditName(state.profile.name); }} className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium">
                {t(lang, "cancel")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">{state.profile.name}</h2>
              <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-primary">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <h3 className="font-display text-sm font-semibold text-foreground tracking-wider mb-3">
          {t(lang, "yourStats").toUpperCase()}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <stat.icon className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground font-display">{stat.value}</span>
              <span className="text-xs text-muted-foreground text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
