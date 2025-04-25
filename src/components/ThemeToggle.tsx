
import { useEffect } from "react"

const ThemeToggle = () => {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])

  // Return null since we don't need the toggle button anymore
  return null
}

export default ThemeToggle
