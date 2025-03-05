import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  async generateBarcode(data: string): Promise<string> {
    if (!data || data.trim() === '') {
      throw new Error('Le texte du code-barres ne peut pas être vide.');
    }

    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: 'code128', // Type de code-barres
          text: data, // Données à encoder
          scale: 3, // Échelle
          height: 10, // Hauteur
          includetext: true, // Inclure le texte sous le code-barres
          textxalign: 'center', // Alignement du texte
        },
        (err, png) => {
          if (err) {
            reject(err);
          } else {
            resolve(`data:image/png;base64,${png.toString('base64')}`);
          }
        },
      );
    });
  }
}