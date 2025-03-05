import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('article')
export class ArticleEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  category: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subCategory: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  salePrice: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantityInStock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qrCode: string;

  @Column({ type: 'varchar', length: 5000, nullable: true })
  barcode: string; // Nouveau champ pour le code-barres
}