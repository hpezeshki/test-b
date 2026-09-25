const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const rid = (prefix: string, len = 8) => {
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `${prefix}_${s}`;
};
/** ZarinPal-style 36-char authority (mock). */
export const ipgAuthority = () => 'A' + String(Math.floor(Math.random() * 1e12)).padStart(35, '0');
export const ipgRefId = () => String(Math.floor(1e11 + Math.random() * 9e11));
export const maskedPan = () => `6037-99${Math.floor(10 + Math.random() * 89)}-****-${Math.floor(1000 + Math.random() * 8999)}`;
