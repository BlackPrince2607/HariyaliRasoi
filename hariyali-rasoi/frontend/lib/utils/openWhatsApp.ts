/** Open WhatsApp reliably — mobile uses same-tab navigation (opens the app). */
export function openWhatsApp(href: string) {
  if (!href) return;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = href;
  } else {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}
