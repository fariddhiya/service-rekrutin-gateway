// import {
//   Controller,
//   Inject,
//   Post,
//   Get,
//   Req,
//   Body,
//   HttpCode,
// } from '@nestjs/common';

// import { AuthService } from '../services/auth.service';

// @Controller('auth')
// export class AuthController {
//   constructor(@Inject(AuthService) private readonly authService: AuthService) {}
//   @Get('/login')
//   @HttpCode(200)
//   async login(@Req() req) {
//     return this.authService.login(req);
//   }

//   @Get('/menus')
//   @HttpCode(200)
//   async getMenus(@Req() req) {
//     return this.authService.getMenus(req);
//   }

//   @Get('/logout')
//   @HttpCode(200)
//   async logout(@Req() req) {
//     return this.authService.logout(req);
//   }
// }
