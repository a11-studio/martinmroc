/** Pre-filled collaboration email for dock / contact Mail actions */
const ADDRESS = "martin@mroc.sk";

const SUBJECT = "Collaboration";

const BODY = `Hey Martin,

I saw your portfolio and I really like it. I'd love to collaborate with you.

Best,
[Your Name]`;

/**
 * Use encodeURIComponent (spaces → %20), not URLSearchParams / + encoding —
 * many mail clients show literal "+" in the body if we use application/x-www-form-urlencoded + for spaces.
 */
export const MAILTO_COLLABORATION_HREF = (() => {
  const q = `subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  return `mailto:${ADDRESS}?${q}`;
})();
