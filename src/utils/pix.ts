/**
 * Utility for generating Brazilian Central Bank (BACEN) EMV PIX BR Code
 * Standard Pix Copia e Cola / QR Code payload
 */

/**
 * Calculates CRC-16 CCITT (0xFFFF initial value, polynomial 0x1021) for PIX EMV Payload
 */
export function calculatePixCrc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Normalizes text to uppercase without accents or special characters for PIX standard
 */
export function normalizePixText(text: string, maxLength: number): string {
  if (!text) return '';
  const clean = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim();
  return clean.slice(0, maxLength);
}

/**
 * Formats an EMV tag: ID (2 chars) + Length (2 chars) + Value
 */
export function formatEmvTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export interface PixPayloadParams {
  pixKey: string;
  pixKeyType?: 'cnpj' | 'cpf' | 'email' | 'phone' | 'random';
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  txid?: string;
  description?: string;
}

/**
 * Generates the official Banco Central do Brasil PIX BR Code payload (Copia e Cola)
 */
export function generatePixPayload(params: PixPayloadParams): string {
  const {
    pixKey,
    merchantName,
    merchantCity = 'BRASIL',
    amount,
    txid = '***'
  } = params;

  if (!pixKey || !pixKey.trim()) {
    return '';
  }

  // Clean key format
  let cleanKey = pixKey.trim();
  if (params.pixKeyType === 'phone' || (!cleanKey.includes('@') && /^\+?[0-9.\-/ ()]+$/.test(cleanKey))) {
    const digits = cleanKey.replace(/\D/g, '');
    if (digits.length === 11 && (cleanKey.startsWith('(') || cleanKey.startsWith('+') || !cleanKey.includes('.'))) {
      cleanKey = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    } else if (digits.length === 10) {
      cleanKey = `+55${digits}`;
    } else if (digits.length === 14 || digits.length === 11) {
      cleanKey = digits;
    }
  }

  // 1. Format Indicator
  let payload = formatEmvTag('00', '01');

  // 2. Point of Initiation Method (12 = dynamic with value, 11 = static)
  payload += formatEmvTag('01', amount && amount > 0 ? '12' : '11');

  // 3. Merchant Account Information (Tag 26)
  const subTag00 = formatEmvTag('00', 'br.gov.bcb.pix');
  const subTag01 = formatEmvTag('01', cleanKey);
  payload += formatEmvTag('26', `${subTag00}${subTag01}`);

  // 4. Merchant Category Code (Tag 52)
  payload += formatEmvTag('52', '0000');

  // 5. Transaction Currency (Tag 53: 986 = BRL)
  payload += formatEmvTag('53', '986');

  // 6. Transaction Amount (Tag 54)
  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatEmvTag('54', formattedAmount);
  }

  // 7. Country Code (Tag 58)
  payload += formatEmvTag('58', 'BR');

  // 8. Merchant Name (Tag 59, max 25 chars)
  const normName = normalizePixText(merchantName || 'DISTRIBUIDORA', 25) || 'DISTRIBUIDORA';
  payload += formatEmvTag('59', normName);

  // 9. Merchant City (Tag 60, max 15 chars)
  const normCity = normalizePixText(merchantCity || 'BRASIL', 15) || 'BRASIL';
  payload += formatEmvTag('60', normCity);

  // 10. Additional Data Field Template (Tag 62, TXID in sub-tag 05)
  const cleanTxid = (txid.replace(/[^A-Za-z0-9]/g, '') || 'BEBEAQUI').slice(0, 25);
  const subTag05 = formatEmvTag('05', cleanTxid || '***');
  payload += formatEmvTag('62', subTag05);

  // 11. CRC16 (Tag 63, prefix '6304')
  payload += '6304';
  const checksum = calculatePixCrc16(payload);

  return `${payload}${checksum}`;
}
