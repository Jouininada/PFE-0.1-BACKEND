import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleHistoryDto {
  @ApiProperty({ example: 2, description: 'Nouvelle version de l\'article' })
  version?: number;

  @ApiProperty({
    example: { description: { oldValue: 'Ancienne description', newValue: 'Nouvelle description' } },
    description: 'Nouvelles modifications apportées à l\'article',
  })
  changes?: Record<string, { oldValue: any; newValue: any }>;
}