// Fairy-themed synthetic sounds via Web Audio API — no external files needed
let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext()
  }
  // Resume if suspended (browser autoplay policy)
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume()
  }
  return sharedCtx
}

function tone(
  freq: number,
  duration: number,
  volume = 0.08,
  type: OscillatorType = 'sine',
  freqEnd?: number,
  delay = 0,
) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.connect(gain)
  gain.connect(ac.destination)
  const t = ac.currentTime + delay
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration * 0.8)
  gain.gain.setValueAtTime(0.001, t)
  gain.gain.linearRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

// Short sparkle click
export function playClick() {
  tone(1200, 0.08, 0.05, 'triangle', 800)
}

// Soft chime for tab navigation
export function playTabSwitch() {
  tone(880, 0.25, 0.07, 'sine')
  tone(1320, 0.2, 0.04, 'sine', undefined, 0.05)
}

// Whoosh for spinning start
export function playSpinStart() {
  tone(200, 0.6, 0.06, 'sawtooth', 600)
}

// Ding when spin stops
export function playSpinStop(rarity: 'common' | 'rare' | 'legendary') {
  if (rarity === 'legendary') {
    // Triumphant major chord
    tone(523, 0.6, 0.1, 'sine')   // C5
    tone(659, 0.55, 0.08, 'sine', undefined, 0.05)  // E5
    tone(784, 0.5, 0.07, 'sine', undefined, 0.1)    // G5
    tone(1046, 0.7, 0.09, 'sine', undefined, 0.15)  // C6
  } else if (rarity === 'rare') {
    // Silver chime cascade
    tone(880, 0.4, 0.08, 'sine')
    tone(1108, 0.35, 0.06, 'sine', undefined, 0.07)
    tone(1320, 0.3, 0.05, 'sine', undefined, 0.14)
  } else {
    // Gentle ding
    tone(660, 0.25, 0.05, 'sine')
  }
}

// Item card hover sparkle (subtle)
export function playItemHover() {
  tone(1400, 0.06, 0.025, 'triangle')
}
