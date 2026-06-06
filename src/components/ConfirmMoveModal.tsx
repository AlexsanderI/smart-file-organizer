type ConfirmMoveModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmMoveModal({
  onCancel,
  onConfirm,
}: ConfirmMoveModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-96 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold">Confirm Move</h3>
        <p className="text-slate-400 text-sm mt-2">
          You are about to move selected files. Conflicts will be skipped. No
          files will be deleted.
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
            Move Selected Files
          </button>
        </div>
      </div>
    </div>
  );
}
