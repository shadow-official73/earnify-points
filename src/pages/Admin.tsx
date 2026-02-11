import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUsers, updateUserProfile, deleteUserData, getUserRole, setUserRole } from "@/lib/firebase";
import { Search, Edit3, Trash2, Ban, Shield, Users, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  phone: string;
  name: string;
  points: number;
  banned: boolean;
  miningActive: boolean;
  createdAt: string;
  role?: string;
}

const Admin = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState("");

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/");
      return;
    }
    loadUsers();
  }, [userRole, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      // Get roles for each user
      const usersWithRoles = await Promise.all(
        allUsers.map(async (u) => ({
          ...u,
          role: await getUserRole(u.id),
        }))
      );
      setUsers(usersWithRoles);
    } catch (err) {
      console.error("Load users error:", err);
      toast({ title: "Users load करने में error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.phone?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditPoints = async (uid: string) => {
    const pts = parseInt(editPoints);
    if (isNaN(pts) || pts < 0) {
      toast({ title: "Invalid points", variant: "destructive" });
      return;
    }
    try {
      await updateUserProfile(uid, { points: pts });
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, points: pts } : u)));
      setEditingUser(null);
      toast({ title: "Points updated!" });
    } catch {
      toast({ title: "Error updating points", variant: "destructive" });
    }
  };

  const handleBanToggle = async (uid: string, currentBanned: boolean) => {
    try {
      await updateUserProfile(uid, { banned: !currentBanned });
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, banned: !currentBanned } : u)));
      toast({ title: currentBanned ? "User unbanned" : "User banned" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("क्या आप सच में इस user को delete करना चाहते हैं?")) return;
    try {
      await deleteUserData(uid);
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      toast({ title: "User deleted" });
    } catch {
      toast({ title: "Error deleting user", variant: "destructive" });
    }
  };

  const handleRoleChange = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await setUserRole(uid, newRole);
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u)));
      toast({ title: `Role changed to ${newRole}` });
    } catch {
      toast({ title: "Error changing role", variant: "destructive" });
    }
  };

  if (userRole !== "admin") return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-display text-sm font-semibold text-foreground tracking-wider">
            ADMIN PANEL
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">{users.length} users</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-foreground text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-xl bg-card border ${user.banned ? "border-destructive/50" : "border-border/50"}`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      {user.name}
                      {user.role === "admin" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">ADMIN</span>
                      )}
                      {user.banned && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-bold">BANNED</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.phone}</p>
                  </div>
                  {editingUser === user.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editPoints}
                        onChange={(e) => setEditPoints(e.target.value)}
                        className="w-20 bg-secondary border border-border rounded px-2 py-1 text-foreground text-sm outline-none"
                      />
                      <button onClick={() => handleEditPoints(user.id)} className="p-1 text-primary">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingUser(null)} className="p-1 text-muted-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-display text-lg font-bold text-foreground">{user.points} pts</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => { setEditingUser(user.id); setEditPoints(user.points.toString()); }}
                    className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium flex items-center justify-center gap-1 border border-border/50"
                  >
                    <Edit3 className="w-3 h-3" /> Points
                  </button>
                  <button
                    onClick={() => handleBanToggle(user.id, user.banned)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border ${
                      user.banned
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }`}
                  >
                    <Ban className="w-3 h-3" /> {user.banned ? "Unban" : "Ban"}
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role || "user")}
                    className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium flex items-center justify-center gap-1 border border-border/50"
                  >
                    <Shield className="w-3 h-3" /> {user.role === "admin" ? "→ User" : "→ Admin"}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="py-2 px-3 rounded-lg bg-destructive/20 text-destructive text-xs font-medium flex items-center justify-center gap-1 border border-destructive/30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">कोई user नहीं मिला</p>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Admin;
