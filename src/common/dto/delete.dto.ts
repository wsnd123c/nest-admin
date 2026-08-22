import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class BatchDeleteDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID(4, { each: true })
  ids: string[]
}
