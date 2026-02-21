import type { FormEventHandler } from 'react';
import Button from './Button';
import ErrorBanner from './ErrorBanner';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface CreateVariantModalProps {
  open: boolean;
  label: string;
  creating: boolean;
  error: string | null;
  onLabelChange: (value: string) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function CreateVariantModal({
  open,
  label,
  creating,
  error,
  onLabelChange,
  onClose,
  onSubmit,
}: CreateVariantModalProps) {
  const { modalRef, initialFocusRef } = useModalAccessibility({
    open,
    allowClose: !creating,
    onClose,
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={() => !creating && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-variant-title"
        aria-describedby="create-variant-description"
        className="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="create-variant-title" className="text-lg font-semibold text-gray-800 mb-3">
          Create Client Variant
        </h3>
        <p id="create-variant-description" className="text-muted text-sm mb-4">
          Snapshot the current resume. Optionally add a label (e.g. &quot;For Acme&quot;).
        </p>
        <form onSubmit={onSubmit} aria-busy={creating}>
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {creating ? "Creating client variant." : ""}
          </p>
          {error && (
            <div className="mb-3">
              <ErrorBanner message={error} compact />
            </div>
          )}
          <label htmlFor="variant-label" className="block text-sm font-medium text-gray-700 mb-1">
            Label (optional)
          </label>
          <input
            ref={initialFocusRef}
            id="variant-label"
            type="text"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary mb-4"
            placeholder="e.g. For Acme"
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={creating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={creating}
              className="w-full sm:w-auto"
            >
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
