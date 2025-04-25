
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    // Update DOM
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-95 cyber-glass cyber-pulse"
    >
      <motion.div
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="h-5 w-5 transition-all" />
        ) : (
          <Sun className="h-5 w-5 transition-all" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default ThemeToggle
