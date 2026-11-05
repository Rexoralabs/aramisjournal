// Ultra Account (name@ultra.co by Rexora) helpers shared by auth, landing and settings.
export const ULTRA_DOMAIN = "ultra.co";

/** Normalize a typed handle: lowercase, strip domain, only a-z 0-9 . _ - */
export function normalizeHandle(input: string): string {
  return input.trim().toLowerCase().replace(/@.*$/, "").replace(/[^a-z0-9._-]/g, "");
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])$/.test(handle);
}

export function handleToAddress(handle: string): string {
  return `${normalizeHandle(handle)}@${ULTRA_DOMAIN}`;
}

export const DESKTOP_INSTALLER_URL = "/downloads/Aramis-Setup-x64.exe";
export const DESKTOP_INSTALLER_NAME = "Aramis-Setup-x64.exe";

/** Starts the installer download. Returns false when the installer is not published yet. */
export async function startDesktopDownload(): Promise<boolean> {
  try {
    const res = await fetch(DESKTOP_INSTALLER_URL, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || type.includes("text/html")) return false;
  } catch {
    return false;
  }
  const a = document.createElement("a");
  a.href = DESKTOP_INSTALLER_URL;
  a.download = DESKTOP_INSTALLER_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

const AUTO_KEY = "ultra-auto-mode";
export const getAutoMode = () => localStorage.getItem(AUTO_KEY) === "on";
export const setAutoMode = (on: boolean) => localStorage.setItem(AUTO_KEY, on ? "on" : "off");
