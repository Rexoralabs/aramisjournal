import { useRef, useLayoutEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUserStreak } from "@/hooks/useStreaks";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

gsap.registerPlugin(ScrollTrigger);

interface Fruit {
  days: number;
  name: string;
  title: string;
  icon: string;
  description: string;
}

const fruits: Fruit[] = [
  { days: 1, name: "Seed", title: "First Seed", icon: "ph:plant-duotone", description: "You planted your first thought" },
  { days: 3, name: "Sprout", title: "Early Sprout", icon: "ph:leaf-duotone", description: "Three days of growth" },
  { days: 7, name: "Lemon", title: "First Harvest", icon: "ph:orange-slice-duotone", description: "A week of consistency" },
  { days: 14, name: "Strawberry", title: "Sweet Progress", icon: "ph:flower-duotone", description: "Two weeks strong" },
  { days: 21, name: "Cherry", title: "Cherry Picked", icon: "ph:flower-tulip-duotone", description: "Three weeks of wisdom" },
  { days: 30, name: "Apple", title: "Golden Apple", icon: "ph:apple-logo-duotone", description: "A month of reflection" },
  { days: 45, name: "Peach", title: "Peach Perfect", icon: "ph:sun-duotone", description: "Six weeks of dedication" },
  { days: 60, name: "Orange", title: "Orange Blossom", icon: "ph:flower-lotus-duotone", description: "Two months of growth" },
  { days: 90, name: "Pomegranate", title: "Rich Harvest", icon: "ph:diamond-duotone", description: "A season of journaling" },
  { days: 100, name: "Fig", title: "Century Fig", icon: "ph:tree-duotone", description: "100 days milestone" },
  { days: 150, name: "Grape", title: "Vineyard", icon: "ph:wine-duotone", description: "Five months cultivated" },
  { days: 200, name: "Mango", title: "Tropical Bliss", icon: "ph:heart-duotone", description: "200 days of wisdom" },
  { days: 250, name: "Pineapple", title: "Golden Crown", icon: "ph:crown-duotone", description: "250 days of mastery" },
  { days: 300, name: "Coconut", title: "Paradise Found", icon: "ph:moon-duotone", description: "Almost a year" },
  { days: 365, name: "Olive", title: "The Ancient Olive", icon: "ph:star-duotone", description: "A full year of reflection" },
  { days: 500, name: "Dragonfruit", title: "Mythical Harvest", icon: "ph:lightning-duotone", description: "Beyond extraordinary" },
  { days: 730, name: "Golden Apple", title: "The Eternal Orchard", icon: "ph:trophy-duotone", description: "Two years of mastery" },
];

// 3D Tree component
function Tree({ position, scale = 1, color = "#2d6a1e" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const trunkColor = "#5c3a1e";
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 1.5, 0.2]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 1.6, -0.15]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#3a7d2a" roughness={1} />
    </mesh>
  );
}

// Camera animation driven by scroll
function CameraRig({ scrollProgress }: { scrollProgress: { current: number } }) {
  useFrame(({ camera }) => {
    const t = scrollProgress.current;
    camera.position.z = 8 - t * 30;
    camera.position.y = 2 + Math.sin(t * Math.PI * 0.5) * 0.5;
    camera.position.x = Math.sin(t * Math.PI * 2) * 2;
    camera.lookAt(0, 1.5, camera.position.z - 10);
  });
  return null;
}

// Scene with trees scattered along the path
function OrchardScene({ scrollProgress }: { scrollProgress: { current: number } }) {
  const trees = useMemo(() => {
    const positions: { pos: [number, number, number]; scale: number; color: string }[] = [];
    const colors = ["#2d6a1e", "#1e5a2d", "#3a7d2a", "#1a4f1a", "#2a6b3a"];
    for (let i = 0; i < 60; i++) {
      const z = -i * 3 - 5;
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (2 + Math.random() * 4);
      positions.push({
        pos: [x, 0, z],
        scale: 0.8 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      // Add some depth trees
      if (Math.random() > 0.5) {
        positions.push({
          pos: [side * (5 + Math.random() * 3), 0, z + Math.random() * 2],
          scale: 0.5 + Math.random() * 0.4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
    return positions;
  }, []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <fog attach="fog" args={["#c8dfc0", 15, 45]} />
      <Ground />
      {trees.map((t, i) => (
        <Tree key={i} position={t.pos} scale={t.scale} color={t.color} />
      ))}
      <CameraRig scrollProgress={scrollProgress} />
      <Environment preset="park" />
    </>
  );
}

const OrchardPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const { data: streakData } = useUserStreak();
  const longestStreak = streakData?.longest_streak || 0;
  const currentStreak = streakData?.current_streak || 0;

  const nextFruit = fruits.find(f => f.days > longestStreak) || fruits[fruits.length - 1];
  const progressToNext = nextFruit ? Math.min((longestStreak / nextFruit.days) * 100, 100) : 100;
  const unlockedCount = fruits.filter(f => longestStreak >= f.days).length;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-driven camera movement
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });

      // Fruit card animations
      const cards = containerRef.current?.querySelectorAll(".fruit-card");
      cards?.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, x: i % 2 === 0 ? -80 : 80, scale: 0.9 },
          {
            opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none reverse" },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed 3D Canvas */}
      <div ref={canvasWrapperRef} className="fixed inset-0 z-0">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
            <OrchardScene scrollProgress={scrollProgress} />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay content */}
      <div className="relative z-10 pointer-events-none">
        {/* Hero */}
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="pointer-events-auto text-center space-y-6">
            <h1 className="text-6xl sm:text-7xl font-serif text-foreground tracking-tight drop-shadow-lg">
              The Orchard
            </h1>
            <p className="font-emphasis text-xl text-foreground/80 max-w-sm mx-auto drop-shadow">
              Where dedication bears fruit
            </p>

            <div className="glass-card p-8 max-w-sm mx-auto space-y-4 bg-card/80 backdrop-blur-lg">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-serif text-foreground">{currentStreak}</span>
                <span className="text-muted-foreground font-ui text-sm">day streak</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm font-ui">
                <span className="text-muted-foreground">{unlockedCount}/{fruits.length} fruits</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Best: {longestStreak}</span>
              </div>
              {longestStreak < nextFruit.days && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-ui">
                    <span className="text-muted-foreground">Next: {nextFruit.name}</span>
                    <span className="text-primary">{longestStreak}/{nextFruit.days}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="animate-bounce mt-8">
              <Icon icon="ph:caret-down" className="h-6 w-6 text-foreground/60 mx-auto" />
            </div>
          </div>
        </div>

        {/* Fruit milestones */}
        <div className="min-h-[200vh] px-4 py-20 space-y-24 max-w-2xl mx-auto">
          {fruits.map((fruit, i) => {
            const unlocked = longestStreak >= fruit.days;
            return (
              <div
                key={fruit.days}
                className={cn(
                  "fruit-card pointer-events-auto glass-card p-6 bg-card/80 backdrop-blur-lg",
                  i % 2 === 0 ? "ml-0 mr-auto" : "mr-0 ml-auto",
                  "max-w-xs"
                )}
              >
                <div className={cn("w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center", unlocked ? "bg-primary/15" : "bg-muted")}>
                  <Icon icon={fruit.icon} className={cn("h-7 w-7", unlocked ? "text-primary" : "text-muted-foreground")} />
                </div>
                <h3 className={cn("font-serif text-lg mb-0.5 text-center", unlocked ? "text-foreground" : "text-muted-foreground")}>
                  {fruit.title}
                </h3>
                <p className={cn("text-xs font-ui mb-2 text-center", unlocked ? "text-primary" : "text-muted-foreground")}>
                  {fruit.days} {fruit.days === 1 ? "day" : "days"}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {unlocked ? fruit.description : "Keep growing..."}
                </p>
                {unlocked && (
                  <div className="absolute top-3 right-3">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div className="min-h-[50vh] flex items-center justify-center pointer-events-auto px-4">
          <p className="font-emphasis text-lg text-foreground/80 max-w-sm mx-auto text-center drop-shadow">
            "Every expert was once a beginner. Every oak tree was once an acorn."
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrchardPage;
