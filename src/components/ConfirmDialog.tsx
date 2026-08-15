"use client";

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[10px] bg-background p-5 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm leading-relaxed text-foreground">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[10px] px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500 transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[10px] bg-risk px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:opacity-90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
