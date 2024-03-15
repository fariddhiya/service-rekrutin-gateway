import { UserEntity } from '../entities/user.entity';

export type AuthUserResponse = Pick<UserEntity, 'id' | 'email' | 'token'>;
