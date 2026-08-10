import { Check, X } from "lucide-react";
import clsx from "clsx";
import {
  APPROVAL_STEP_LABELS,
  getStatusInfo,
} from "../../constants/bookingStatus";

/**
 * Shows how far a request has travelled through the two-stage approval.
 *
 * Without this the booking page only said "รอดำเนินการ", which gives no hint
 * that there are two separate approvers still to come.
 */
export default function ApprovalStepper({
  status,
}: {
  status: string | null | undefined;
}) {
  const info = getStatusInfo(status);
  const isRejected = status === "rejected";

  return (
    <div>
      <ol className="flex items-start gap-1" role="list">
        {APPROVAL_STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const done = !isRejected && info.step >= stepNumber;
          const current = !isRejected && info.step === stepNumber;
          const isLast = index === APPROVAL_STEP_LABELS.length - 1;

          // A rejection stops the flow, so mark where it stopped.
          const rejectedHere = isRejected && index === 0;

          return (
            <li key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className="flex-1">
                  {index > 0 && (
                    <div
                      className={clsx(
                        "h-1.5 w-full rounded-full",
                        done ? "bg-emerald-500" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>

                <div
                  className={clsx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 text-base font-bold",
                    isRejected && rejectedHere && "border-red-200 bg-red-600 text-white",
                    isRejected && !rejectedHere && "border-slate-100 bg-slate-200 text-slate-500",
                    !isRejected && done && "border-emerald-100 bg-emerald-600 text-white",
                    !isRejected && !done && "border-slate-100 bg-slate-200 text-slate-600",
                    current && "ring-4 ring-emerald-200"
                  )}
                >
                  {isRejected && rejectedHere ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : done && !current ? (
                    <Check className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </div>

                <div className="flex-1">
                  {!isLast && (
                    <div
                      className={clsx(
                        "h-1.5 w-full rounded-full",
                        !isRejected && info.step > stepNumber
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              </div>

              <span
                className={clsx(
                  "mt-2 text-center text-sm",
                  current ? "font-bold text-slate-900" : "font-medium text-slate-600"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-base text-slate-800 ring-1 ring-slate-200">
        {info.description}
      </p>
    </div>
  );
}
