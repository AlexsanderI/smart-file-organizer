type ConfirmUndoModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmUndoModal({
  onCancel,
  onConfirm,
}: ConfirmUndoModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-96 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold">Confirm Undo</h3>
        <p className="text-slate-400 text-sm mt-2">
          This will attempt to restore files from the latest operation. Undo is
          best-effort and file-level atomic.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-transparent border border-slate-700 rounded hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded hover:bg-slate-800"
          >
            Undo Latest Operation
          </button>
        </div>
      </div>
    </div>
  );
}
