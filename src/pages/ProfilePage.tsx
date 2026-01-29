import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Settings, LogOut, Moon, Bell, Shield, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useStreaks";
import { toast } from "sonner";

const ProfilePage = () => {
  const [notifications, setNotifications] = useState(true);
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: streakData } = useUserStreak();
  const navigate = useNavigate();

  const displayName = profile?.display_name || "Writer";
  const joinedDate = user?.created_at 
    ? format(new Date(user.created_at), "MMMM yyyy")
    : "Unknown";
  const totalEntries = streakData?.total_entries || 0;
  const currentStreak = streakData?.current_streak || 0;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", toggle: true, value: notifications, onChange: setNotifications },
    { icon: Moon, label: "Dark Mode", info: "Always on" },
    { icon: Shield, label: "Privacy & Security", link: true },
    { icon: Settings, label: "App Settings", link: true },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif text-foreground">Profile</h1>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-glow p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {joinedDate}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-foreground">
                {totalEntries}
              </p>
              <p className="text-xs text-muted-foreground">journal entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif font-bold text-primary">
                {currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{item.label}</span>
              </div>
              
              {item.toggle ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onChange?.(!item.value);
                  }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    item.value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: item.value ? 20 : 2 }}
                    className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              ) : item.info ? (
                <span className="text-sm text-muted-foreground">{item.info}</span>
              ) : item.link ? (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              ) : null}
            </motion.button>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={handleSignOut}
            className="w-full glass-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-xs text-muted-foreground">
            Luxe Journal v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with ✨ for mindful journaling
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
