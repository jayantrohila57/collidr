/** Lightweight user-agent label for session lists (no external dependency). */
export function sessionDeviceLabel(
  userAgent: string | null | undefined,
): string {
  if (!userAgent?.trim()) {
    return "Unknown device";
  }
  const ua = userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return /CriOS/i.test(ua) ? "iPhone · Chrome" : "iPhone · Safari";
  }
  if (/Android/i.test(ua)) {
    return /Chrome/i.test(ua) ? "Android · Chrome" : "Android device";
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Mac · Chrome";
    if (/Firefox/i.test(ua)) return "Mac · Firefox";
    if (/Safari/i.test(ua)) return "Mac · Safari";
    return "Mac";
  }
  if (/Windows/i.test(ua)) {
    if (/Edg/i.test(ua)) return "Windows · Edge";
    if (/Chrome/i.test(ua)) return "Windows · Chrome";
    if (/Firefox/i.test(ua)) return "Windows · Firefox";
    return "Windows";
  }
  if (/Linux/i.test(ua)) {
    return /Firefox/i.test(ua) ? "Linux · Firefox" : "Linux";
  }
  return "Web browser";
}
