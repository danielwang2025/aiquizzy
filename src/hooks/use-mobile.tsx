
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches)
    }
    
    // Set initial value
    updateMatches()
    
    // Add listener for changes
    mediaQuery.addEventListener("change", updateMatches)
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", updateMatches)
    }
  }, [query])
  
  return matches
}

export function useScreenSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial size

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
