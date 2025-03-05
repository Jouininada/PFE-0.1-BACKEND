import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ResponseArticleDto {
  @ApiProperty({ example: 1, type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ example: faker.commerce.product(), type: String })
  @IsString()
  title: string;

  @ApiProperty({ example: faker.commerce.productDescription(), type: String })
  @IsString()
  description: string;

  @ApiProperty({ example: faker.random.alphaNumeric(10), type: String })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Électronique', type: String })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Téléphones', type: String })
  @IsString()
  subCategory: string;

  @ApiProperty({ example: 400.0, type: Number })
  @IsNumber()
  purchasePrice: number;

  @ApiProperty({ example: 600.0, type: Number })
  @IsNumber()
  salePrice: number;

  @ApiProperty({ example: 50, type: Number })
  @IsNumber()
  quantityInStock: number;

  @ApiProperty({ example: 'https://example.com/qr-code.png', type: String })
  @IsString()
  qrCode: string;

  @ApiProperty({ example: '123456789012', type: String })
  @IsString()
  barcode: string; // Nouveau champ pour le code-barres
}