const QRCode = require('qrcode');
const CryptoJS = require('crypto-js');

const QR_SECRET = process.env.COOKIE_SECRET || 'thouram-qr-secret-key-2025';

/**
 * Generates an encrypted check-in payload for a volunteer's event pass
 */
function generateCheckInToken(eventId, volunteerId, assignmentId) {
  const payload = {
    eventId: eventId.toString(),
    volunteerId: volunteerId.toString(),
    assignmentId: assignmentId.toString(),
    timestamp: Date.now()
  };
  return CryptoJS.AES.encrypt(JSON.stringify(payload), QR_SECRET).toString();
}

/**
 * Verifies and decrypts check-in token
 */
function verifyCheckInToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, QR_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

/**
 * Generates data URL of QR code
 */
async function generateQRCodeDataUrl(dataString) {
  try {
    return await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#004653',
        light: '#ffffff'
      }
    });
  } catch (err) {
    throw err;
  }
}

module.exports = {
  generateCheckInToken,
  verifyCheckInToken,
  generateQRCodeDataUrl
};
