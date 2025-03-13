import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'Article avec code-barres', type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Description de l\'article avec code-barres', type: String })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Électronique', type: String })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({ example: '123456789012', type: String })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({ example: 'draft', type: String })
  @IsString()
  @IsNotEmpty()
  status: string; // Nouveau champ pour le statut
}