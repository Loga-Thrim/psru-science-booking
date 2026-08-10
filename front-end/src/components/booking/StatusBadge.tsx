import { getStatusInfo } from "../../constants/bookingStatus";
import clsx from "clsx";

/**
 * The one badge used everywhere a reservation status is shown.
 *
 * Always renders an icon next to the text so the status is still readable
 * for someone who cannot separate the amber and green fills.
 */
export default function StatusBadge({
  status,
  size = "md",
}: {
  status: string | null | undefined;
  size?: "md" | "lg";
}) {
  const info = getStatusInfo(status);
  const Icon = info.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full font-semibold whitespace-nowrap",
        info.badgeClass,
        size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1.5 text-sm"
      )}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
      {info.label}
    </span>
  );
}
