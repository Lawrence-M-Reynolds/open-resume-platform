import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ThemeScheme = "light" | "dark" | "forest" | "sunset";
export type TextScale = "small" | "medium" | "large";

export interface ThemePreferences {
  scheme: ThemeScheme;
  textScale: TextScale;
}

const STORAGE_KEY = "open-resume-ui-preferences-v1";
const DEFAULT_PREFERENCES: ThemePreferences = {
  scheme: "light",
  textScale: "medium",
};

const FONT_SCALE_BY_TEXT_SIZE: Record<TextScale, number> = {
  small: 0.94,
  medium: 1,
  large: 1.08,
};

const THEME_SCHEMES: ThemeScheme[] = ["light", "dark", "forest", "sunset"];

interface ThemeContextValue {
  preferences: ThemePreferences;
  setScheme: (scheme: ThemeScheme) => void;
  setTextScale: (textScale: TextScale) => void;
  resetPreferences: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function parseStoredPreferences(value: string | null): ThemePreferences {
  if (!value) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(value) as Partial<ThemePreferences>;
    const scheme = THEME_SCHEMES.includes(parsed.scheme as ThemeScheme)
      ? (parsed.scheme as ThemeScheme)
      : DEFAULT_PREFERENCES.scheme;
    const textScale =
      parsed.textScale === "small" ||
      parsed.textScale === "medium" ||
      parsed.textScale === "large"
        ? parsed.textScale
        : DEFAULT_PREFERENCES.textScale;

    return { scheme, textScale };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    return parseStoredPreferences(localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    const root = document.documentElement;
    THEME_SCHEMES.forEach((scheme) => root.classList.remove(`theme-${scheme}`));
    root.classList.add(`theme-${preferences.scheme}`);
    root.style.setProperty(
      "--app-font-scale",
      String(FONT_SCALE_BY_TEXT_SIZE[preferences.textScale]),
    );
    root.setAttribute("data-theme", preferences.scheme);
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      preferences,
      setScheme: (scheme) => {
        setPreferences((current) => ({ ...current, scheme }));
      },
      setTextScale: (textScale) => {
        setPreferences((current) => ({ ...current, textScale }));
      },
      resetPreferences: () => {
        setPreferences(DEFAULT_PREFERENCES);
      },
    }),
    [preferences],
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
}

export function useThemePreferences(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemePreferences must be used inside ThemeProvider");
  }
  return context;
}
