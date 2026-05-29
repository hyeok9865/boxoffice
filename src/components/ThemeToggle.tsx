import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Read from localStorage or system theme
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        return saved;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 flex items-center justify-center"
      aria-label="테마 전환"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -10, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-slate-700" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
