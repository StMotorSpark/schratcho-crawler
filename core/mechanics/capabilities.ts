// Browser capability detection utilities

export interface BrowserCapabilities {
  hapticFeedback: boolean;
  soundEffects: boolean;
  webAudioAPI: boolean;
  vibrationAPI: boolean;
}

/**
 * Detect if haptic feedback is available
 * Note: iOS does not support the Vibration API
 */
export function detectHapticCapability(): boolean {
  return 'vibrate' in navigator && typeof navigator.vibrate === 'function';
}

/**
 * Detect if Web Audio API is available
 */
export function detectWebAudioCapability(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Detect all browser capabilities
 */
export function detectCapabilities(): BrowserCapabilities {
  const vibrationAPI = detectHapticCapability();
  const webAudioAPI = detectWebAudioCapability();

  return {
    hapticFeedback: vibrationAPI,
    soundEffects: webAudioAPI,
    webAudioAPI,
    vibrationAPI,
  };
}

/**
 * Get user-friendly status message for a capability
 */
export function getCapabilityStatus(available: boolean): string {
  return available ? '✅ Supported' : '❌ Not Supported';
}

/**
 * Get detailed information about browser capabilities
 */
export function getCapabilityDetails(): {
  [key: string]: { available: boolean; description: string };
} {
  const caps = detectCapabilities();

  return {
    'Haptic Feedback': {
      available: caps.hapticFeedback,
      description: caps.hapticFeedback
        ? 'Device can provide vibration feedback'
        : 'Vibration API not supported (iOS devices do not support this)',
    },
    'Sound Effects': {
      available: caps.soundEffects,
      description: caps.soundEffects
        ? 'Web Audio API available for sound generation'
        : 'Web Audio API not supported',
    },
  };
}
