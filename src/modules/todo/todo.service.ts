import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository ,FindOptionsWhere} from 'typeorm'


import { paginate } from '~/helper/paginate'
import { Pagination } from '~/helper/paginate/pagination'
import { TodoEntity } from '~/modules/todo/todo.entity'

import { TodoDto, TodoQueryDto, TodoUpdateDto } from './todo.dto'

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private todoRepository: Repository<TodoEntity>,
  ) {}

  async list({
    page,
    pageSize,
  }: TodoQueryDto,userInfo:IAuthUser): Promise<Pagination<TodoEntity>> {
    const where: FindOptionsWhere<TodoEntity> = {
      user:{
        id:userInfo.uid
      }
    };
    return paginate(this.todoRepository, { page, pageSize },{where})
  }

  async detail(id: string): Promise<TodoEntity> {
    const item = await this.todoRepository.findOneBy({ id })
    if (!item)
      throw new NotFoundException('未找到该记录')

    return item
  }

 async create(dto: TodoDto, user: IAuthUser): Promise<TodoEntity> {
    const todo = this.todoRepository.create({
      value: dto.value,
      user: { id: user.uid } 
    });
    return this.todoRepository.save(todo);

  }

  async update(id: string, dto: TodoUpdateDto) {
    await this.todoRepository.update(id, dto)
  }

  async delete(id: string) {
    const item = await this.detail(id)

    await this.todoRepository.remove(item)
  }
}
