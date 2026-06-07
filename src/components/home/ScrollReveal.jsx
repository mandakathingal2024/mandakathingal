'use client'
import { useEffect } from 'react'

const ScrollReveal = () => {
  useEffect(() => {
    // Engage the hidden-then-reveal animation only after a paint frame confirms
    // the page is actually rendering.
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add('anim')
      checkReveal()
    })

    let reveals = Array.from(document.querySelectorAll('.reveal'))

    function checkReveal() {
      const vh = window.innerHeight
      reveals = reveals.filter((el) => {
        const top = el.getBoundingClientRect().top
        if (top < vh * 0.92) {
          el.classList.add('in')
          return false
        }
        return true
      })
    }

    window.addEventListener('scroll', checkReveal, { passive: true })
    window.addEventListener('resize', checkReveal)

    // Safety fallback: ensure nothing stays hidden
    const fallback = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
    }, 1400)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
      window.removeEventListener('scroll', checkReveal)
      window.removeEventListener('resize', checkReveal)
    }
  }, [])

  return null
}

export default ScrollReveal
