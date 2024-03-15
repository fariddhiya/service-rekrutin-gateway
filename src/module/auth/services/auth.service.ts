// import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// import * as nativeJwt from 'jsonwebtoken';

// @Injectable()
// export class AuthService {
//   constructor(@Inject(UserRepository) private userRepository: UserRepository) {}

//   async checkAuthUser(token: string): Promise<AuthUserResponse> {
//     const secretkey = process.env.JWT_PRIVATE_KEY;
//     const checkToken: any = await nativeJwt.verify(
//       token,
//       secretkey,
//       function (err, decode) {
//         if (err) {
//           throw new UnauthorizedException('Unauthorized - ' + err.message);
//         }

//         return decode;
//       },
//     );
//     const { userId } = checkToken;
//     if (!userId)
//       throw new UnauthorizedException('Unauthorized - Invalid Token Signature');

//     if (!dataAuthUser || Object.keys(dataAuthUser).length === 0)
//       throw new UnauthorizedException('Unauthorized - Token is expired');

//     //Multiple Session Login Validation
//     if (dataAuthUser.token_active != token) {
//       throw new UnauthorizedException(
//         'Unauthorized - Session expired, your session active at another device',
//       );
//     }

//     // Re-Set Redis for update redis expired
//     // await this.redis.set(dataAuthUser, keyRedis, 1, 'hour');
//     await this.redisClient.set(
//       keyRedis,
//       JSON.stringify(dataAuthUser),
//       true,
//       1,
//       RedisExpireType.Hour,
//     );

//     const dataUser = {
//       id: dataAuthUser.id,
//       role_id: dataAuthUser.role_id,
//       role_name: dataAuthUser.role_name,
//       is_partner: dataAuthUser.is_partner,
//       name: dataAuthUser.name,
//       username: dataAuthUser.username,
//       email: dataAuthUser.email,
//       status: dataAuthUser.status,
//       warehouse_id: dataAuthUser.warehouse_id,
//       is_testing: dataAuthUser.is_testing,
//       token_active: dataAuthUser.token_active,
//     };

//     return dataUser;
//   }
// }
