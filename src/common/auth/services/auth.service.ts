import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseLoginDto } from '../dtos/login.response.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { CreateUserDto } from 'src/modules/user/dtos/user.create.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Generate JWT Tokens
  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('app.jwtAccessTokenExpiration'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('app.jwtRefreshTokenExpiration'),
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(id, { refreshToken: hashedRefreshToken });
  }

  // Login User
  async login(
    usernameOrEmail: string,
    password: string,
  ): Promise<ResponseLoginDto> {
    const user = await this.userService.findOneByCondition({
      filter: `username||$eq||${usernameOrEmail}||$or||email||$eq||${usernameOrEmail}`,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Save the hashed refresh token in the database
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // Register User
  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.save(createUserDto);
    return user;
  }

  // Refresh Token Logic
  async refreshToken(
    id: number,
    refreshToken: string,
  ): Promise<ResponseLoginDto> {
    const user = await this.userService.findOneById(id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(user);

    await this.saveRefreshToken(user.id, newRefreshToken);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
