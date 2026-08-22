import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { IsNotEmpty } from 'class-validator';
import { CommonEntity } from '~/common/entity/common.entity'
import { UserEntity } from '~/modules/user/user.entity'

@Entity('todo')
export class TodoEntity extends CommonEntity {
  @Column()
  @ApiProperty({ description: 'todo' })
  value: string

  @ApiProperty({ description: 'todo' })
  @Column({ default: false })
  status: boolean
  // @ApiProperty({ description: '用户ID' })
  // @IsNotEmpty()
  // userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  @IsNotEmpty()
  user: Relation<UserEntity>
}
