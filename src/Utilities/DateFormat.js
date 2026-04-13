export function DateFormat(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function TimeAgo(value) {
  if (!value) return "—";

  const elapsedMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(elapsedMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}