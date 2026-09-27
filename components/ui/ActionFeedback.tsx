import { AlertCircle, CheckCircle2 } from "lucide-react";

type Props = { status: "success" | "error"; message: string };

export default function ActionFeedback({ status, message }: Props) {
  return (
    <span className={`action-feedback ${status}`} role="status" aria-live="polite">
      {status === "success" ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}
      <span>{message}</span>
    </span>
  );
}
