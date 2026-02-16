import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import gsap from "gsap";
import authBg from "@/assets/auth-bg.jpg";

type AuthMode = "login" | "signup";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(leftRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(rightRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power2.out" });
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    if (mode === "signup" && password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) toast.error(error.message);
        else { toast.success("Welcome back!"); navigate("/"); }
      } else {
        const { error } = await signUp(email, password, displayName || "Writer");
        if (error) toast.error(error.message);
        else { toast.success("Account created! Check your email to verify."); }
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel — Image Background */}
      <div
        ref={leftRef}
        className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        <h1 className="relative z-10 text-2xl font-brand tracking-widest text-white">Aramis</h1>
        <div className="relative z-10 max-w-sm">
          <p className="font-emphasis text-2xl text-white/90 leading-relaxed">
            "Get access to your personal hub for clarity, reflection, and productivity."
          </p>
          <p className="text-sm font-ui text-white/60 mt-4">Where silence meets reflection</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div ref={rightRef} className="w-full max-w-md space-y-8">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-3xl font-brand tracking-widest text-foreground">Aramis</h1>
            <p className="text-sm font-emphasis text-muted-foreground mt-1">Where silence meets reflection</p>
          </div>

          {/* Accent */}
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Icon icon="ph:sparkle-duotone" className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl font-serif text-foreground">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm font-ui text-muted-foreground mt-2">
              {mode === "login"
                ? "Sign in to continue your journey"
                : "Start your mindful journaling practice"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-ui text-muted-foreground">Display Name</label>
                <div className="relative">
                  <Icon icon="ph:user-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-ui text-muted-foreground">Email</label>
              <div className="relative">
                <Icon icon="ph:envelope-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-ui text-muted-foreground">Password</label>
              <div className="relative">
                <Icon icon="ph:lock-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <Icon icon={showPassword ? "ph:eye-slash-duotone" : "ph:eye-duotone"} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full rounded-full bg-foreground text-background py-3 font-ui text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <Icon icon="ph:arrow-right" className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-4 text-muted-foreground font-ui">or continue with</span></div>
          </div>

          {/* Placeholder OAuth */}
          <div className="flex gap-3 justify-center">
            <button className="h-11 w-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Icon icon="ph:google-logo" className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="h-11 w-11 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <Icon icon="ph:apple-logo" className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm font-ui text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-medium hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
