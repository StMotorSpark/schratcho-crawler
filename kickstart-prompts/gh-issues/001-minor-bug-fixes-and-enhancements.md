# Overview
Before continuing with the next major feature, there are some minor fixes and features that would make a big difference. This issue addresses mobile haptic feedback, sound effect compatibility issues, and adds a settings menu to display browser capabilities.

# GitHub Issue
**Issue Title**: Minor bug fixes and enhancements

**Issue Link**: (GitHub Issue Reference)

# Requirements

## Primary Issues to Fix
1. **Haptic Feedback on Mobile**: When on mobile (tested on iPhone with Safari and Edge), the haptic feedback does not work as expected.
2. **Sound Effects on Mobile Edge**: On mobile iPhone, sound effects work on Safari but do not seem to work on Edge. On desktop, sound effects DO work on Edge.

## Secondary Capabilities
Create a simple settings menu that:
- Lists haptic compatibility status
- Lists sound compatibility status
- Serves as a foundation for future settings features
- Does not need to function in a meaningful way beyond displaying capabilities

# Technical Details

## Haptic Feedback Investigation
Current implementation uses `navigator.vibrate()` API:
- Located in `src/components/ScratchTicketCSS.tsx`
- Triggered on `touchStart` (10ms vibration) and `touchMove` (5ms vibration, throttled)
- Need to investigate iOS-specific requirements and browser compatibility

## Sound Effects Investigation
Current implementation uses Web Audio API:
- Located in `src/utils/sounds.ts`
- Uses `AudioContext` (with webkit prefix fallback)
- Need to investigate iOS Edge browser compatibility
- May need user interaction requirement handling

## Settings Menu Requirements
- Create a new component for settings menu
- Detect and display haptic feedback capability
- Detect and display sound effect capability
- Basic UI that fits with current game-themed design
- Should be accessible from the main app

# Out of Scope
- Full settings functionality (volume controls, haptic intensity, etc.)
- Backend persistence of settings
- Complex UI/UX for settings menu
- Fixing unrelated issues or bugs

# Implementation Approach

## Phase 1: Documentation
- Create this markdown file in `kickstart-prompts/gh-issues/` for traceability

## Phase 2: Investigate Issues
- Research iOS Safari and Edge haptic feedback requirements
- Research iOS Edge sound compatibility issues
- Determine if fixes are possible or if documentation is needed

## Phase 3: Fix or Document Issues
- Implement fixes for haptic feedback if possible
- Implement fixes for sound effects if possible
- Document any known limitations or workarounds

## Phase 4: Settings Menu
- Create a simple settings/capabilities component
- Add feature detection for haptics
- Add feature detection for sound
- Integrate into main app UI

# Acceptance Criteria
- [x] Markdown file created with details of this task for traceability
- [ ] Haptics on mobile has been fixed or documented with known limitations
- [ ] Sound issues have been fixed or documented with known limitations
- [ ] Simple settings menu has been created showing browser capabilities
- [ ] All changes pass lint and build checks
- [ ] Code follows existing patterns and conventions

# Testing Notes
- Test on iPhone Safari and Edge browsers
- Verify haptic feedback works on both browsers
- Verify sound effects work on both browsers
- Verify settings menu displays correct capability information
- Test on desktop browsers to ensure no regression

# References
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Vibration API: https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
- iOS Safari Web Audio requirements
- iOS Browser compatibility matrix
