const QRCode = require('qrcode');
const fs = require('fs');

const url = 'https://openclaw.35-195-246-45.nip.io';

const options = {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.92,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
};

QRCode.toFile('openclaw-qrcode.png', url, options)
  .then(() => console.log('QR Code erstellt: openclaw-qrcode.png'))
  .catch(err => console.error('Fehler:', err));
