import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IQueryObject } from 'src/common/database/interfaces/database-query-options.interface';
import { StorageService } from '../services/storage.service';
import { UploadEntity } from '../repositories/entities/upload.entity';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StorageBadRequestException } from '../errors/storage.bad-request.error';

@ApiTags('storage')
@Controller({
  version: '1',
  path: '/storage',
})
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':id')
  async getFileByIdOrSlug(@Param('id') id: number): Promise<UploadEntity> {
    return this.storageService.findOneById(id);
  }

  @Get('/all')
  async findAll(@Query() options: IQueryObject): Promise<UploadEntity[]> {
    return await this.storageService.findAll(options);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post('upload/multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 Mo par fichier
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadEntity[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
    return this.storageService.storeMultipleFiles(files);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadEntity> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Enregistrez le fichier dans la base de données
    return this.storageService.store(file);
  }

  @Get('/file/slug/:slug')
  async downloadFileBySlug(
    @Param('slug') slug: string,
    @Res() res: Response,
  ): Promise<void> {
    const upload = await this.storageService.findBySlug(slug);
    const fileStream = await this.storageService.loadResource(slug);
    res.setHeader('Content-Type', upload.mimetype);
    res.setHeader('Content-Length', upload.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${upload.filename}"`,
    );
    fileStream.pipe(res);
  }

  @Get('file/id/:id')
  async downloadFileById(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<void> {
    const upload = await this.storageService.findOneById(id);
    const fileStream = await this.storageService.loadResource(upload.slug);
    res.setHeader('Content-Type', upload.mimetype);
    res.setHeader('Content-Length', upload.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${upload.filename}"`,
    );
    fileStream.pipe(res);
  }
}