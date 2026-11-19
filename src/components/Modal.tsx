// Shared window frame for Examples, Cheatsheet and Practice. Closes on Esc or a click outside.
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

export function Modal({ title, onClose, wide, children }: ModalProps) {
  useEffect(() => {
    function closeOnEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[85vh] w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl ${
          wide ? 'max-w-4xl' : 'max-w-2xl'
        }`}
      >
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-foreground-muted hover:bg-surface-elevated hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/** Search box used at the top of the Examples and Cheatsheet windows. */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="shrink-0 border-b border-border p-3">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full rounded border border-border bg-surface-subtle px-3 py-2 text-sm outline-none focus:border-foreground/40"
      />
    </div>
  );
}
