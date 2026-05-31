const PHONE = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const HEX_PRIVKEY = /\b0x[a-f0-9]{64}\b/gi;
const MNEMONIC_LIKE = /\b([a-z]{3,8}\s){11,23}[a-z]{3,8}\b/gi;

export function redactSensitive(input: string) {
  return input
    .replace(EMAIL, "[redacted-email]")
    .replace(PHONE, "[redacted-phone]")
    .replace(HEX_PRIVKEY, "[redacted-key]")
    .replace(MNEMONIC_LIKE, "[redacted-seed]");
}
