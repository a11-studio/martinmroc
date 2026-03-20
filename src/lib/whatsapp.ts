/**
 * WhatsApp chat link — phone digits are built at runtime (char codes), not stored
 * as one scrape-friendly literal, so simple bots are less likely to harvest the number.
 */
export function getWhatsAppChatHref(): string {
  const e164Digits = String.fromCharCode(
    0x34,
    0x32,
    0x31,
    0x39,
    0x31,
    0x31,
    0x30,
    0x31,
    0x34,
    0x34,
    0x31,
    0x30
  );
  return `https://wa.me/${e164Digits}`;
}
