import { useEffect, useRef, useCallback } from 'react'

// ── useKitchenSound ───────────────────────────────────────
// Plays a bell/alert sound when new orders arrive
// Uses Web Audio API — no external files needed
// ─────────────────────────────────────────────────────────

export function useKitchenSound() {
  const audioCtx = useRef(null)

  const getCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx.current
  }, [])

  // Play a pleasant bell/ding sound
  const playBell = useCallback((times = 2) => {
    try {
      const ctx = getCtx()
      const playNote = (freq, startTime, duration = 0.4) => {
        const oscillator = ctx.createOscillator()
        const gainNode   = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type      = 'sine'
        oscillator.frequency.setValueAtTime(freq, startTime)

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const now = ctx.currentTime
      for (let i = 0; i < times; i++) {
        playNote(880, now + i * 0.35)       // A5 - first ding
        playNote(1100, now + i * 0.35 + 0.1) // C#6 - second ding
      }
    } catch (err) {
      console.warn('Audio play failed:', err)
    }
  }, [getCtx])

  // Urgent alert for very old pending orders
  const playAlert = useCallback(() => {
    try {
      const ctx = getCtx()
      const now = ctx.currentTime
      const playBeep = (freq, start) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0.3, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15)
        osc.start(start); osc.stop(start + 0.15)
      }
      [0, 0.2, 0.4, 0.7, 0.9, 1.1].forEach((t, i) =>
        playBeep(i % 2 === 0 ? 660 : 880, now + t)
      )
    } catch {}
  }, [getCtx])

  return { playBell, playAlert }
}

// ── useNewOrderAlert ──────────────────────────────────────
// Watches orders list and plays bell on new pending orders

export function useNewOrderAlert(orders) {
  const { playBell }    = useKitchenSound()
  const prevCountRef    = useRef(null)
  const initializedRef  = useRef(false)

  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length

    // Skip first render (don't alert on page load)
    if (!initializedRef.current) {
      initializedRef.current = true
      prevCountRef.current   = pendingCount
      return
    }

    if (prevCountRef.current !== null && pendingCount > prevCountRef.current) {
      playBell(3)
    }

    prevCountRef.current = pendingCount
  }, [orders, playBell])
}
