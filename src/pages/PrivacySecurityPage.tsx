import { useRef, useLayoutEffect } from "react";
import { ArrowLeft, Shield, Key, Download, Trash2, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySecurityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  const handleExportData = () => {
    toast.info("Data export feature coming soon");
  };

  const handleDeleteAccount = () => {
    toast.error("Please contact support to delete your account");
  };

  const securityItems = [
    {
      icon: Key,
      title: "Change Password",
      description: "Update your account password",
      action: () => toast.info("Password reset email will be sent"),
    },
    {
      icon: Fingerprint,
      title: "Two-Factor Authentication",
      description: "Coming soon",
      disabled: true,
    },
    {
      icon: Shield,
      title: "Active Sessions",
      description: "Manage devices logged into your account",
      action: () => toast.info("Session management coming soon"),
    },
  ];

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-3xl font-serif text-foreground">Privacy & Security</h1>
        </div>

        {/* Account Info */}
        <div className="glass-card p-5">
          <h3 className="font-serif text-lg text-foreground mb-2">Account</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Security Options */}
        <div className="space-y-2">
          {securityItems.map((item) => (
            <button
              key={item.title}
              onClick={item.action}
              disabled={item.disabled}
              className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-lg bg-muted">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left flex-1">
                <p className="font-ui text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Data Management */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-foreground">Your Data</h3>

          <button
            onClick={handleExportData}
            className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="p-2 rounded-lg bg-muted">
              <Download className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left flex-1">
              <p className="font-ui text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all your journal entries</p>
            </div>
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card p-4 flex items-center gap-4 hover:border-destructive/30 transition-colors">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-ui text-destructive">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and data</p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your journal entries and data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Privacy Info */}
        <div className="glass-card p-5">
          <h3 className="font-serif text-lg text-foreground mb-2">Privacy</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your journal entries are encrypted and stored securely. We never share your personal data with third parties. Your reflections remain private to you.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrivacySecurityPage;
