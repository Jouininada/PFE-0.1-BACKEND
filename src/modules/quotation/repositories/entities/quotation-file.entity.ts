import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { EntityHelper } from 'src/common/database/interfaces/database.entity.interface';
import { QuotationEntity } from './quotation.entity';
import { UploadEntity } from 'src/common/storage/repositories/entities/upload.entity';

@Entity('quotation-upload')
export class QuotationUploadEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QuotationEntity)
  @JoinColumn({ name: 'quotationId' })
  quotation: QuotationEntity;

  @Column({ type: 'int' })
  quotationId: number;

  @ManyToOne(() => UploadEntity)
  @JoinColumn({ name: 'uploadId' })
  upload: UploadEntity;

  @Column({ type: 'int' })
  uploadId: number;
}
