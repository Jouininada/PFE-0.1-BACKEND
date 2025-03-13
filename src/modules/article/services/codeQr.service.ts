import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(data: string): Promise<string> {
    try {
      // Génère un code QR sous forme de Data URL (image encodée en base64)
      const qrCode = await QRCode.toDataURL(data);
      return qrCode;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }
}