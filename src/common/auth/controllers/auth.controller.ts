import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../utils/public-strategy';
import { AuthService } from '../services/auth.service';
import { ResponseLoginDto } from '../dtos/login.response.dto';
import { ResponseRefreshTokenDto } from '../dtos/refresh-token.response.dto';
import { ResponseUserDto } from 'src/modules/user/dtos/user.response.dto';
import { CreateUserDto } from 'src/modules/user/dtos/user.create.dto';

@ApiTags('auth')
@Controller({ version: '1', path: '/auth' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({
    status: 200,
    description: '',
    type: [ResponseUserDto],
  })
  signIn(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  @ApiOperation({ summary: 'User Registration' })
  @ApiResponse({
    status: 200,
    description: '',
    type: [CreateUserDto],
  })
  register(@Body() registerDto: Record<string, any>) {
    const payload = {
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
    };
    return this.authService.register(payload);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body() body: ResponseRefreshTokenDto,
  ): Promise<ResponseLoginDto> {
    return this.authService.refreshToken(body.userId, body.refreshToken);
  }
}
