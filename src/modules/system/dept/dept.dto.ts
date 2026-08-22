import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class DeptDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  @MinLength(1)
  name: string

  @ApiProperty({ description: '父级部门id' })
  @IsUUID(4)
  @IsOptional()
  parentId: string

  @ApiProperty({ description: '排序编号', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderNo: number
}

export class TransferDeptDto {
  @ApiProperty({ description: '需要转移的管理员列表编号', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(4, { each: true })
  userIds: string[]

  @ApiProperty({ description: '需要转移过去的系统部门ID' })
  @IsUUID(4)
  deptId: string
}

export class MoveDept {
  @ApiProperty({ description: '当前部门ID' })
  @IsUUID(4)
  id: string

  @ApiProperty({ description: '移动到指定父级部门的ID' })
  @IsUUID(4)
  @IsOptional()
  parentId: string
}

export class MoveDeptDto {
  @ApiProperty({ description: '部门列表', type: [MoveDept] })
  @ValidateNested({ each: true })
  @Type(() => MoveDept)
  depts: MoveDept[]
}

export class DeptQueryDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  @IsOptional()
  name?: string
}
