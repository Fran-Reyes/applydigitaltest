import { BadRequestException } from '@nestjs/common';
import { MaxLimitPipe } from './max-limit.pipe';

describe('MaxLimitPipe', () => {
  const pipe = new MaxLimitPipe();

  it('usa 5 por defecto cuando no viene limit', () => {
    expect(pipe.transform({})).toEqual({ limit: 5 });
  });

  it('permite limit <= 5', () => {
    expect(pipe.transform({ limit: 3 })).toEqual({ limit: 3 });
  });

  it('lanza error si limit > 5', () => {
    expect(() => pipe.transform({ limit: 6 })).toThrow(BadRequestException);
  });
});
