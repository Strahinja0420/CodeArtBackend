import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';

export class AuthResponse {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty()
  access_token?: string;
}
