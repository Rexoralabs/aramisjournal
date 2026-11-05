import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/landing/DownloadButton";
import authPhoto from "@/assets/auth-evening.jpg.asset.json";

const photo = import.meta.env.DEV ? `https://aramisdaily.lovable.app${authPhoto.url}` : authPhoto.url;

const pillars = [
  { n: "I", title: "Write", body: "A quiet page each morning. Prompts that ask the right question, never the loud one." },
  { n: "II", title: "Reflect", body: "Patterns in your mood and words surface gently, the way a good friend notices." },
  { n: "III", title: "Keep", body: "The Cellar holds the thoughts worth returning to — aged, tagged, and always yours." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-reveal]", { opacity: 0, y: 24, duration: 0.9, stagger: 0.12, ease: "expo.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-wide items-center justify-between px-6 py-6">
        <span className="font-brand text-xl tracking-widest">Aramis</span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/auth")}>Sign in</Button>
          <DownloadButton variant="ink" />
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-wide gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:items-center lg:pt-20">
          <div className="space-y-8">
            <p data-reveal className="font-ui text-xs uppercase tracking-widest text-muted-foreground">
              A Rexora sanctuary · Part of Ultra
            </p>
            <h1 data-reveal className="font-serif text-6xl leading-none md:text-7xl">
              Where silence <em className="italic text-primary">meets</em> reflection.
            </h1>
            <p data-reveal className="max-w-reading font-emphasis text-xl text-muted-foreground">
              Aramis is a daily journal, focus room and thought cellar — one calm place for the mind,
              signed in everywhere with your name@ultra.co.
            </p>
            <div data-reveal className="flex flex-wrap gap-3">
              <Button variant="ink" size="pill" className="w-auto px-8" onClick={() => navigate("/auth")}>
                Enter Aramis
                <Icon icon="ph:arrow-right" className="h-4 w-4" />
              </Button>
              <DownloadButton className="w-auto px-8" label="Download for Windows" />
            </div>
          </div>
          <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-card bg-foreground">
            <img src={photo} alt="Evening sky over the horizon" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 image-overlay" />
            <p className="absolute bottom-8 left-8 right-8 font-emphasis text-2xl text-image-foreground">
              "The page is patient. It waits for you."
            </p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-wide gap-10 px-6 py-20 md:grid-cols-3">
            {pillars.map((p) => (
              <article key={p.n} className="space-y-3">
                <span className="font-brand text-sm text-primary">{p.n}</span>
                <h2 className="font-serif text-4xl">{p.title}</h2>
                <p className="font-ui text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-reading space-y-6 px-6 py-24 text-center">
            <h2 className="font-serif text-5xl">One account. Every Rexora app.</h2>
            <p className="font-emphasis text-xl text-muted-foreground">
              Claim your handle once — yourname@ultra.co — and it signs you into Aramis on the web and
              on your desktop, with nothing more to remember.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="ink" size="pill" className="w-auto px-8" onClick={() => navigate("/auth?mode=signup")}>
                Claim your @ultra.co
              </Button>
              <DownloadButton className="w-auto px-8" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-8 font-ui text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Rexora</span>
          <span>Ultra Account · name@ultra.co</span>
        </div>
      </footer>
    </div>
  );
}
