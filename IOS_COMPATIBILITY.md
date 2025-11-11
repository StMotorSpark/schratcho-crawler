# iOS Compatibility Guide

This document details the iOS-specific compatibility considerations and fixes implemented in Schratcho Crawler.

## Overview

iOS Safari and iOS-based browsers (Edge, Chrome, etc.) have specific requirements and limitations when it comes to web APIs. This guide documents these issues and how they've been addressed.

## Issues and Solutions

### 1. Haptic Feedback (Vibration API)

#### Issue
- **Status**: Not Supported on iOS
- **Affected Browsers**: All iOS browsers (Safari, Edge, Chrome, Firefox)
- **Root Cause**: iOS does not implement the W3C Vibration API (`navigator.vibrate()`)

#### Why iOS Doesn't Support It
Apple has chosen not to implement the Vibration API on iOS devices, likely due to:
- User experience concerns (unwanted vibrations from websites)
- Battery life considerations
- Control over haptic feedback (restricted to native apps via Haptic Feedback API)

#### Implementation
Our code safely handles this limitation:

```typescript
// Feature detection before use
if (navigator.vibrate) {
  navigator.vibrate(10); // Will never execute on iOS
}
```

#### User Experience
- The Settings menu displays "❌ Not Supported" for haptic feedback on iOS
- The feature detection prevents errors on iOS devices
- Users are informed via the settings menu about this limitation

#### Alternative Solutions Considered
- **Haptic Feedback Web API**: Not standardized or widely supported
- **Native App Wrapper**: Would require building a native iOS app (future consideration)
- **Visual Feedback Only**: Current fallback approach

---

### 2. Sound Effects (Web Audio API)

#### Issue
- **Status**: Fixed ✅
- **Affected Browsers**: iOS Safari, iOS Edge (before fix)
- **Root Cause**: iOS requires AudioContext to be resumed after user interaction

#### Why This Happens
iOS browsers start the AudioContext in a "suspended" state for:
- **Battery Conservation**: Prevent websites from playing audio without user consent
- **User Privacy**: Prevent websites from tracking users via audio fingerprinting
- **User Control**: Ensure users explicitly enable audio playback

#### Technical Details

**Before Fix:**
```typescript
// AudioContext was created but never resumed
const ctx = new AudioContext(); // Starts in 'suspended' state on iOS
oscillator.start(); // Fails silently on iOS
```

**After Fix:**
```typescript
class SoundManager {
  async initialize(): Promise<void> {
    const ctx = this.getAudioContext();
    
    // Explicitly resume on user interaction (iOS requirement)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  playScratch() {
    const ctx = this.getAudioContext();
    
    // Check and resume if needed before playing
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return; // Skip this play, will work on next interaction
    }
    
    // Play sound...
  }
}
```

#### Implementation
1. **Initialization on User Gesture**: `soundManager.initialize()` is called on first touch/click
2. **State Checking**: Each sound playback checks if context is suspended
3. **Automatic Resume**: Attempts to resume if suspended
4. **Graceful Degradation**: Fails silently if resume doesn't work

#### Testing
To verify the fix works on iOS:
1. Open the app on iOS Safari or iOS Edge
2. Tap/click anywhere on the scratch ticket
3. Sound should play immediately (may have 1 interaction delay)
4. Subsequent interactions should have sound

---

## Browser Compatibility Matrix

| Feature | Desktop Chrome | Desktop Edge | Desktop Safari | iOS Safari | iOS Edge | iOS Chrome |
|---------|----------------|--------------|----------------|------------|----------|------------|
| **Web Audio API** | ✅ Full | ✅ Full | ✅ Full | ✅ Fixed* | ✅ Fixed* | ✅ Fixed* |
| **Vibration API** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **Touch Events** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **CSS Masking** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

\* Requires user interaction to initialize AudioContext

---

## Settings Menu

The Settings menu provides real-time capability detection:

### Capabilities Displayed
1. **Haptic Feedback**: Shows if Vibration API is available
2. **Sound Effects**: Shows if Web Audio API is available

### User Guidance
The settings menu includes helpful notes:
- iOS limitation explanation for haptic feedback
- Instructions for enabling sound (user interaction required)

### Implementation
```typescript
// Capability detection in src/utils/capabilities.ts
export function detectCapabilities(): BrowserCapabilities {
  return {
    hapticFeedback: 'vibrate' in navigator,
    soundEffects: !!(window.AudioContext || webkitAudioContext),
    // ... more capabilities
  };
}
```

---

## Testing Guidelines

### Manual Testing on iOS

#### Testing Haptic Feedback
1. Open Settings menu
2. Verify "Haptic Feedback" shows "❌ Not Supported"
3. Try scratching - should work without errors despite no vibration

#### Testing Sound Effects
1. Open Settings menu
2. Verify "Sound Effects" shows "✅ Supported"
3. Scratch the ticket
4. Confirm scratch sounds play
5. Complete ticket and confirm win sound plays

### Edge Cases to Test
- [ ] First interaction after page load (should initialize audio)
- [ ] Switching from background to foreground
- [ ] Multiple rapid scratches (throttled sounds)
- [ ] Settings menu on different screen sizes
- [ ] Portrait and landscape orientations

---

## Known Limitations

### iOS-Specific
1. **No Haptic Feedback**: Cannot be implemented without native app wrapper
2. **Audio Latency**: First sound may have slight delay due to context initialization
3. **Background Audio**: Audio stops when app goes to background (expected iOS behavior)

### General
1. **Browser Prefixes**: Still using webkit prefix for older browsers
2. **Audio Fingerprinting**: Some privacy extensions may block Web Audio API
3. **Low Power Mode**: iOS Low Power Mode may affect audio performance

---

## Future Improvements

### Potential Enhancements
1. **Native App Wrapper**: Use Capacitor or React Native to access native haptic feedback
2. **Audio Sprites**: Pre-load sounds to reduce latency
3. **Fallback Animations**: Enhanced visual feedback when haptics unavailable
4. **User Preferences**: Allow users to disable sounds/haptics

### Browser API Evolution
Keep an eye on:
- **Haptic Feedback API**: Experimental API that may provide better haptic control
- **Web Audio API v2**: Improvements to audio handling
- **iOS Safari Updates**: Apple may add Vibration API support in the future

---

## References

### Documentation
- [MDN: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN: AudioContext.state](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/state)

### iOS-Specific
- [Apple: Safari Web Audio Best Practices](https://developer.apple.com/documentation/webkit/delivering_video_content_for_safari)
- [Can I Use: Vibration API](https://caniuse.com/vibration)
- [Can I Use: Web Audio API](https://caniuse.com/audio-api)

### Related Issues
- [GitHub Issue: iOS Vibration API Support](https://bugs.webkit.org/show_bug.cgi?id=227448)
- [W3C: Vibration API Specification](https://www.w3.org/TR/vibration/)

---

## Changelog

### 2025-11-11 - Initial iOS Compatibility
- ✅ Fixed Web Audio API on iOS (AudioContext resume)
- ✅ Documented iOS Vibration API limitation
- ✅ Added Settings menu with capability detection
- ✅ Created comprehensive iOS compatibility guide

---

## Support

If you encounter issues with iOS compatibility:
1. Check the Settings menu for capability status
2. Ensure you've tapped the screen at least once (for audio initialization)
3. Try force-refreshing the page (Cmd+Shift+R on iOS Safari)
4. Check browser console for any error messages

For persistent issues, please file a GitHub issue with:
- Device model and iOS version
- Browser name and version
- Steps to reproduce
- Console error messages (if any)
