import Button from "./Button";
import { useModalAccessibility } from "../hooks/useModalAccessibility";
import {
  useThemePreferences,
  type TextScale,
  type ThemeScheme,
} from "./ThemeProvider";
import { useState } from "react";

interface ThemeSettingsButtonProps {
  className?: string;
}

const SCHEME_OPTIONS: Array<{
  id: ThemeScheme;
  label: string;
  description: string;
  swatch: string;
}> = [
  {
    id: "light",
    label: "Light",
    description: "Clean, neutral contrast for daytime usage.",
    swatch: "linear-gradient(135deg,#f8fafc 0%,#dbeafe 100%)",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-glare palette for dark environments.",
    swatch: "linear-gradient(135deg,#0b1220 0%,#1e293b 100%)",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Muted green palette with calm contrast.",
    swatch: "linear-gradient(135deg,#f2f7f1 0%,#bbf7d0 100%)",
  },
  {
    id: "sunset",
    label: "Sunset",
    description: "Warm palette with amber accents.",
    swatch: "linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%)",
  },
];

const TEXT_SIZE_OPTIONS: Array<{
  id: TextScale;
  label: string;
  description: string;
}> = [
  {
    id: "small",
    label: "Small",
    description: "Compact layout with slightly smaller text.",
  },
  {
    id: "medium",
    label: "Default",
    description: "Balanced size for most screens.",
  },
  {
    id: "large",
    label: "Large",
    description: "Larger text for improved readability.",
  },
];

export default function ThemeSettingsButton({
  className,
}: ThemeSettingsButtonProps) {
  const { preferences, setScheme, setTextScale, resetPreferences } =
    useThemePreferences();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { modalRef, initialFocusRef } = useModalAccessibility<HTMLButtonElement>(
    {
      open,
      allowClose: true,
      onClose: close,
    },
  );

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Theme & Text
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={close}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="display-settings-title"
            aria-describedby="display-settings-description"
            className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="display-settings-title"
              className="text-lg font-semibold text-gray-800 mb-2"
            >
              Display Settings
            </h3>
            <p
              id="display-settings-description"
              className="text-sm text-muted mb-5"
            >
              Update theme and text size. Preferences are saved in this browser.
            </p>

            <section className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Color scheme
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {SCHEME_OPTIONS.map((option, index) => {
                  const selected = preferences.scheme === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      ref={index === 0 ? initialFocusRef : null}
                      onClick={() => setScheme(option.id)}
                      className={`rounded border p-3 text-left transition-colors duration-200 ${
                        selected
                          ? "border-primary bg-primary-light/40"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-gray-300"
                          style={{ background: option.swatch }}
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                      </span>
                      <p className="text-xs text-muted mt-1">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Text size
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {TEXT_SIZE_OPTIONS.map((option) => {
                  const selected = preferences.textScale === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTextScale(option.id)}
                      className={`rounded border p-3 text-left transition-colors duration-200 ${
                        selected
                          ? "border-primary bg-primary-light/40"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {option.label}
                      </div>
                      <p className="text-xs text-muted mt-1">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={resetPreferences}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={close}
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
