// Sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Play scratch sound effect
  playScratch() {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Create a scratching noise using white noise
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(100, ctx.currentTime);
      
      // Quick fade in and out
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      // Silently fail if audio context is not available
      console.warn('Could not play scratch sound:', error);
    }
  }

  // Play win sound effect
  playWin() {
    try {
      const ctx = this.getAudioContext();
      
      // Create a celebratory chord progression
      const notes = [523.25, 659.25, 783.99]; // C, E, G (major chord)
      
      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        
        // Stagger the notes slightly
        const startTime = ctx.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    } catch (error) {
      // Silently fail if audio context is not available
      console.warn('Could not play win sound:', error);
    }
  }
}

export const soundManager = new SoundManager();
