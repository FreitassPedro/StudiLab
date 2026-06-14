"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import React from "react"

export default function ThemeSwitch() {
    const { resolvedTheme, setTheme } = useTheme()

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const isLight = resolvedTheme === "light"

    return (
        <button
            type="button"
            aria-label={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground hover:bg-accent"
        >
            {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    )

}