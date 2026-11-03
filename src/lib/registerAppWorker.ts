/** Keep app-shell caching out of development and embedded previews. */
export function isPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  const platform = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
  return (platform && /^(?:(?:id-preview|preview)(?:-[a-z0-9]+)?--.+|project--.+-dev)$/.test(host.split('.')[0]))
    || /(^|\.)(lovableproject\.com|lovableproject-dev\.com|beta\.lovable\.dev)$/.test(host);
}

export async function registerAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const refused = !import.meta.env.PROD || window.self !== window.top
    || isPreviewHost(window.location.hostname) || new URLSearchParams(window.location.search).get("sw") === "off";
  try {
    if (refused) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.filter(r =>
        [r.active, r.waiting, r.installing].some(w => w && new URL(w.scriptURL).pathname === "/sw.js")
      ).map(r => r.unregister()));
      return;
    }
    const registration = await navigator.serviceWorker.register("/sw.js");
    await registration.update();
  } catch (error) {
    console.warn("App offline support is unavailable", error);
  }
}