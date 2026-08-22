import { HttpStatus, NotAcceptableException, Param, ParseUUIDPipe } from '@nestjs/common'

export function IdParam() {
  return Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE, exceptionFactory: (_error) => {
    throw new NotAcceptableException('id 格式不正确')
  } }))
}
