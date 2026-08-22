import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class OperatorDto {
  @ApiHideProperty()
  @Exclude()
  createBy: string

  @ApiHideProperty()
  @Exclude()
  updateBy: string
}
