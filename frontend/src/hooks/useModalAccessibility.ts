import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

interface UseModalAccessibilityOptions {
  open: boolean;
  allowClose: boolean;
  onClose: () => void;
}

export function useModalAccessibility<TInitial extends HTMLElement = HTMLInputElement>({
  open,
  allowClose,
  onClose,
}: UseModalAccessibilityOptions) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<TInitial | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const allowCloseRef = useRef(allowClose);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    allowCloseRef.current = allowClose;
    onCloseRef.current = onClose;
  }, [allowClose, onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalRef.current) return;

      if (event.key === "Escape") {
        if (!allowCloseRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || active == null || !modalRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || active == null || !modalRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  return {
    modalRef,
    initialFocusRef,
  };
}
