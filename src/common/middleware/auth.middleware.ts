// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private authService: AuthService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     /**
//      * need set header response, for handle error response coming from middleware.
//      * (for handle issue CORS client when Preflight process)
//      */
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, Authorization');

//     try {
//       /*** set authorization */
//       const { method, headers } = req;
//       const bearerToken = 'Bearer ';
//       const authorization = headers.authorization || '';
//       const token = authorization.replace(bearerToken, '');

//       if (token !== '') {
//         /**
//          * check token
//          * get data user
//          */
//         const dataUser = await this.authService.checkAuthUser(token);

//         if (dataUser) {
//           req['user'] = dataUser;
//           req['token'] = token;
//           next();
//         } else {
//           const err = new Error('Unauthorized - Auth user is empty');
//           err['status'] = 401;
//           next(err);
//         }
//       } else {
//         const err = new Error('Unauthorized - Token is empty');
//         err['status'] = 401;
//         next(err);
//       }
//     } catch (err) {
//       next(err);
//     }
//   }
// }
