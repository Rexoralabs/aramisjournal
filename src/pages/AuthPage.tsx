import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleToAddress, isValidHandle, normalizeHandle } from "@/lib/ultra";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import gsap from "gsap";
import authPhoto from "@/assets/auth-evening.jpg.asset.json";
import { Button } from "@/components/ui/button";

const authBg = import.meta.env.DEV ? `https://aramisdaily.lovable.app${authPhoto.url}` : authPhoto.url;

type AuthMode = "login" | "signup";

const AuthPage = () => {
  const [params] = useSearchParams();
  const intent = params.get("intent");
  const [mode, setMode] = useState<AuthMode>(params.get("mode") === "signup" ? "signup" : "login");
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
    const handle = normalizeHandle(email);
    if (!handle || !password) { toast.error("Please fill in all fields"); return; }
    if (!isValidHandle(handle)) { toast.error("Handles are 3–30 characters: letters, numbers, dots, dashes"); return; }
    const address = handleToAddress(handle);
    if (mode === "signup" && password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(address, password);
        if (error) toast.error(error.message);
        else { toast.success("Welcome back!"); navigate(intent === "download" ? "/?intent=download" : "/"); }
      } else {
        const { error } = await signUp(address, password, displayName || handle);
        if (error) toast.error(error.message.includes("registered") ? `${address} is already taken` : error.message);
        else { toast.success(`Welcome, ${address}`); navigate(intent === "download" ? "/?intent=download" : "/"); }
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel — Edge-to-edge Image */}
      <div ref={leftRef} className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-foreground">
        <img
          src={authBg}
          alt="Aramis — serene landscape"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 image-overlay" />
        <h1 className="relative z-10 text-2xl font-brand tracking-widest text-image-foreground">Aramis</h1>
        <div className="relative z-10 max-w-sm">
          <p className="font-emphasis text-2xl text-image-foreground/90 leading-relaxed">
            "Get access to your personal hub for clarity, reflection, and productivity."
          </p>
          <p className="text-sm font-ui text-image-foreground/60 mt-4">Where silence meets reflection</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div ref={rightRef} className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-3xl font-brand tracking-widest text-foreground">Aramis</h1>
            <p className="text-sm font-emphasis text-muted-foreground mt-1">Where silence meets reflection</p>
          </div>

          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Icon icon="ph:sparkle-duotone" className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-sans font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your Ultra Account"}
            </h2>
            <p className="text-sm font-ui text-muted-foreground mt-2">
              {mode === "login" ? "Sign in with your Ultra Account" : "Claim your name@ultra.co"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-ui text-muted-foreground">Display Name</label>
                <div className="relative">
                  <Icon icon="ph:user-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-ui text-muted-foreground">Ultra Account</label>
              <div className="relative">
                <Icon icon="ph:at-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" autoComplete="username" value={email} onChange={(e) => setEmail(normalizeHandle(e.target.value))} placeholder="yourname"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-24 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-ui text-muted-foreground">@ultra.co</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-ui text-muted-foreground">Password</label>
              <div className="relative">
                <Icon icon="ph:lock-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" />
                <Button variant="bare" size="inline" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Icon icon={showPassword ? "ph:eye-slash-duotone" : "ph:eye-duotone"} className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button variant="ink" size="pill" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <Icon icon="ph:arrow-right" className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs font-ui text-muted-foreground">
            Ultra Account by Rexora — one name@ultra.co for every Rexora app.
          </p>

          <p className="text-center text-sm font-ui text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" size="inline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;