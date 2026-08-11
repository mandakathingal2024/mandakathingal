'use client'
import { useEffect } from 'react'

const ScrollReveal = () => {
  useEffect(() => {
    let scheduled = false

    // Reveal any not-yet-revealed .reveal element that is within view. Re-queries
    // the DOM each pass so content that mounts LATER (e.g. after async data or
    // sign-in) is handled — otherwise it would stay stuck at opacity:0.
    function checkReveal() {
      scheduled = false
      const vh = window.innerHeight
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('in')
      })
    }
    function schedule() {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(checkReveal)
    }

    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('anim')
      checkReveal()
    })

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // Catch content that renders after the initial pass (async fetches, auth).
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true })

    // Safety net: nothing should ever stay hidden. Reveal all remaining a short
    // while after the last DOM change settles.
    const fallback = setInterval(() => {
      const hidden = document.querySelectorAll('.reveal:not(.in)')
      if (hidden.length) hidden.forEach((el) => el.classList.add('in'))
    }, 1500)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(fallback)
      mo.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return null
}

export default ScrollReveal
