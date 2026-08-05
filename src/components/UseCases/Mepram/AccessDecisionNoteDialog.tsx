import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReviewAction = "reject" | "revoke";

interface AccessDecisionNoteDialogProps {
  action: ReviewAction;
  requestLabel: string;
  note: string;
  processing: boolean;
  onNoteChange: (note: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AccessDecisionNoteDialog({
  action,
  requestLabel,
  note,
  processing,
  onNoteChange,
  onCancel,
  onConfirm,
}: AccessDecisionNoteDialogProps) {
  const isReject = action === "reject";
  const title = isReject ? "Reject access request" : "Revoke access";
  const actionLabel = isReject ? "Reject request" : "Revoke access";
  const helpText = isReject
    ? "This reason will be included in the rejection email."
    : "This reason will be included in the revocation email.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {requestLabel}
            </p>
          </div>
        </div>

        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Decision reason
        </label>
        <textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Write a short reason for this decision..."
          className="mt-2 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          autoFocus
        />
        <p className="mt-2 text-xs text-slate-500">{helpText}</p>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={processing || !note.trim()}
            className={
              isReject
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }
          >
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
