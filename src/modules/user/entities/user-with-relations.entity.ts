import { Experience } from '../../experience/entities/experience.entity';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserWithRelations extends User {
  @ApiProperty({ type: () => [Experience] })
  experiences: Experience[];

  @ApiProperty()
  qrStyle: any; //TODO: CHANGE TO ENTITY CLASS ONCE CREATED
}
