'use client';

import { useCallback } from 'react';

type SoundType = 'success' | 'error' | 'notification';

export function useAudio() {
  const playSound = useCallback((type: SoundType) => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let oscillator: OscillatorNode;
    let gainNode: GainNode;

    try {
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);

        switch (type) {
        case 'success':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;

        case 'error':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'notification':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        }

        oscillator.onended = () => {
            audioContext.close();
        };

    } catch (e) {
      console.error('Failed to play sound', e);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    }
  }, []);

  return { playSound };
}
