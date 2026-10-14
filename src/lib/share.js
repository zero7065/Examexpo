export function shareToWhatsApp(text, url = "") {
  const fullText = url ? `${text}\n\n${url}` : text;
  const encoded = encodeURIComponent(fullText);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

export function shareToTwitter(text, url = "") {
  const fullText = url ? `${text} ${url}` : text;
  const encoded = encodeURIComponent(fullText);
  window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
}

export function shareNative(text, url = "") {
  if (navigator.share) {
    navigator.share({ title: "ExamPadi", text, url }).catch(() => {});
  } else {
    shareToWhatsApp(text, url);
  }
}

export function copyShareLink(path) {
  const url = `${window.location.origin}${path}`;
  navigator.clipboard.writeText(url).catch(() => {});
  return url;
}

export function getWhatsAppShareLink(phoneNumber, text) {
  const cleaned = phoneNumber.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
