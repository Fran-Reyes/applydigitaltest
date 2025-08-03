import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  contentfulId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  category!: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: Number,
    example: 199.99,
  })
  price!: number | null;

  @ApiProperty({ required: false, nullable: true, example: 'USD' })
  currency!: string | null;

  @ApiProperty()
  isDeleted!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
