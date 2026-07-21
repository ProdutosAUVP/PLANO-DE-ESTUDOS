import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
      }
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-all duration-[240ms] ease-out hover:border-primary/50 hover:text-foreground hover:shadow-sm active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
