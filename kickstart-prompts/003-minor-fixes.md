# Overview
Now that we have completed the demo of the multiple scratch areas with CSS masking, sound effects, and prize logic, let's address some minor fixes and enhancements to polish the experience.

# Observed Issues:
1. **Positioning of scratch event listeners**: The scratch areas sometimes do not align perfectly with the visual elements, causing scratching to feel off.
    - Example: With the 3 scratch areas, the touch/mouse event on the shows that scratch position lower than the actual event position. On the middle scratch area, the offset is less pronounced. THe bottom scratch area is almost aligned correctly.
2. **Scratch amount to reveal detection**: The threshold for detecting when an area is fully scratched seems off. You can generally get to a point where the prize is revealed but the "win" state does not trigger.
    - Example: Sometimes you can see the prize clearly but the win sound and message do not trigger.
3. **Performance on mobile devices**: On mobile devices when using touch controls, the scratch areas sometimes flash while scratching, indicating potential performance issues.
    - Example: On iPhone and Android devices, the scratch area flickers during scratching.

# Additional Enhancements:
- **Visual Scratching Token**: Add a small token (like a coin or a stylus) that follows the cursor/touch point to enhance the scratching experience. This should be a small graphic that moves with the user's input.
- **Haptic Feedback on Mobile**: Implement haptic feedback when scratching on mobile devices to enhance the tactile experience.
- **Sound Variation**: Introduce slight variations in the scratching sound to prevent it from becoming monotonous during extended scratching sessions.
- **Win Animation**: Add a brief animation when the user wins, such as confetti or a sparkle effect, to make the win feel more rewarding.

# Definition of Done:
- [ ] Scratch event listeners are correctly aligned with visual scratch areas across all three sections.
- [ ] Scratch amount detection is calibrated so that the win state triggers reliably when the prize is fully revealed.
- [ ] Performance issues on mobile devices are resolved, ensuring smooth scratching without flickering.
- [ ] A visual scratching token is implemented that follows the user's input.
- [ ] Haptic feedback is added for mobile devices during scratching.
- [ ] Sound variations are introduced to the scratching sound effect.
- [ ] A win animation is implemented to celebrate when the user reveals a prize.

## Out of scope:
- Major redesign of the scratch-off ticket layout or graphics.
- Changes to the prize logic or types of prizes offered.
- Implementation of new game mechanics beyond the scratching experience.