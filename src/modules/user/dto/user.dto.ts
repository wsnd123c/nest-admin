import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator'
import { isEmpty } from 'lodash'

import { PagerDto } from '~/common/dto/pager.dto'

export class UserDto {
  @ApiProperty({ description: '头像' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ description: '登录账号', example: 'admin' })
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(4)
  @MaxLength(20)
  username: string

  @ApiProperty({ description: '登录密码', example: 'a123456' })
  @IsOptional()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: '密码必须包含数字、字母，长度为6-16',
  })
  password: string

  @ApiProperty({ description: '归属角色', type: [String] })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID(4, { each: true, message: '角色ID必须是UUID格式' })
  roleIds: string[]

  @ApiProperty({ description: '归属大区', type: String })
  @IsUUID(4, { message: '部门ID必须是UUID格式' })
  @IsOptional()
  deptId?: string

  @ApiProperty({ description: '呢称', example: 'admin' })
  @IsOptional()
  @IsString()
  nickname: string

  @ApiProperty({ description: '邮箱', example: 'bqy.dev@qq.com' })
  @ValidateIf(o => !isEmpty(o.email))
  @IsEmail()
  email: string

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ description: 'QQ' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{4,10}$/)
  @MinLength(5)
  @MaxLength(11)
  qq?: string

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiProperty({ description: '状态' })
  @IsIn([0, 1])
  @IsOptional()
  status: number
}

export class UserUpdateDto extends PartialType(UserDto) {}

export class UserQueryDto extends IntersectionType(PagerDto<UserDto>, PartialType(UserDto)) {
  @ApiProperty({ description: '归属大区', type: String, required: false })
  @IsUUID(4)
  @IsOptional()
  deptId?: string

  @ApiProperty({ description: '状态', example: 0, required: false })
  @IsIn([0, 1])
  @IsOptional()
  status?: number
}
