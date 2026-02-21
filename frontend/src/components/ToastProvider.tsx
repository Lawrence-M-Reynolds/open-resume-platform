import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastOptions {
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (options: ToastOptions) => void;
  error: (options: ToastOptions) => void;
  info: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const MAX_TOASTS = 4;
const DEFAULT_DURATION_MS = 4500;

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toastStyle(variant: ToastVariant): string {
  if (variant === 'success') {
    return 'border-green-200 bg-green-50 text-green-900';
  }
  if (variant === 'error') {
    return 'border-red-200 bg-red-50 text-red-900';
  }
  return 'border-blue-200 bg-blue-50 text-blue-900';
}

function toastIcon(variant: ToastVariant): string {
  if (variant === 'success') return '✓';
  if (variant === 'error') return '!';
  return 'i';
}

function toastAriaRole(variant: ToastVariant): 'status' | 'alert' {
  return variant === 'error' ? 'alert' : 'status';
}

function toastAriaLive(variant: ToastVariant): 'polite' | 'assertive' {
  return variant === 'error' ? 'assertive' : 'polite';
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-3 px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toastAriaRole(toast.variant)}
          aria-live={toastAriaLive(toast.variant)}
          aria-atomic="true"
          className={`pointer-events-auto rounded-lg border shadow-lg ring-1 ring-black/5 p-4 ${toastStyle(toast.variant)}`}
          style={{ animation: 'toast-in 220ms ease-out' }}
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-semibold">
              {toastIcon(toast.variant)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-sm/5 opacity-90 break-words">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-1 text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-current/40"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timerMapRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timerId = timerMapRef.current.get(id);
    if (timerId != null) {
      window.clearTimeout(timerId);
      timerMapRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, options: ToastOptions) => {
      const id = createToastId();
      const nextToast: ToastItem = {
        id,
        variant,
        title: options.title,
        description: options.description,
        durationMs: options.durationMs,
      };

      setToasts((prev) => {
        const trimmed = prev.slice(-(MAX_TOASTS - 1));
        return [...trimmed, nextToast];
      });

      const timeoutMs = options.durationMs ?? DEFAULT_DURATION_MS;
      const timerId = window.setTimeout(() => {
        dismiss(id);
      }, timeoutMs);

      timerMapRef.current.set(id, timerId);
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timerMapRef.current;
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId));
      timers.clear();
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      success: (options) => pushToast('success', options),
      error: (options) => pushToast('error', options),
      info: (options) => pushToast('info', options),
      dismiss,
    }),
    [dismiss, pushToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
