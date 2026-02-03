/**
 * Premium haptic feedback system for mobile interactions
 * Uses Web Vibration API with graceful fallback
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30],
  error: [50, 30, 50],
  selection: 5,
};

let enabled = true;

/**
 * Trigger haptic feedback
 * @param pattern - The haptic pattern to play
 */
export function haptic(pattern: HapticPattern = 'light'): void {
  if (!enabled) return;
  
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silent fail on unsupported devices
    }
  }
}

/**
 * Enable or disable haptic feedback globally
 */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

/**
 * Check if haptics are currently enabled
 */
export function isHapticsEnabled(): boolean {
  return enabled;
}
