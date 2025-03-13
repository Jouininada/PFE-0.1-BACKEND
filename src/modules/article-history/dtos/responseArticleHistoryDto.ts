import { ApiProperty } from '@nestjs/swagger';

export class ResponseArticleHistoryDto {
  @ApiProperty({ example: 1, description: 'ID de l\'entrée d\'historique' })
  id: number;

  @ApiProperty({ example: 1, description: 'Version de l\'article' })
  version: number;

  @ApiProperty({
    example: { title: { oldValue: 'Ancien titre', newValue: 'Nouveau titre' } },
    description: 'Modifications apportées à l\'article',
  })
  changes: Record<string, { oldValue: any; newValue: any }>;

  @ApiProperty({ example: '2023-10-01T12:00:00Z', description: 'Date de la modification' })
  date: Date;

  @ApiProperty({ example: 1, description: 'ID de l\'article associé' })
  articleId: number;
}