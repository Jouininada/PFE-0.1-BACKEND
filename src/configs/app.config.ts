import { registerAs } from '@nestjs/config';
import { ENUM_APP_ENVIRONMENT } from 'src/app/constants/app.enum.constant';

export default registerAs(
  'app',
  (): Record<string, any> => ({
    name: process.env.APP_NAME ?? 'Invoice System API Server',
    env: process.env.APP_ENV ?? ENUM_APP_ENVIRONMENT.DEVELOPMENT,

    globalPrefix: '/api',
    http: {
      enable: process.env.HTTP_ENABLE === 'true' || false,
      host: process.env.APP_HOST ?? 'localhost',
      port: process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 3000,
    },

    jobEnable: process.env.JOB_ENABLE === 'true' || false,
    uploadPath: process.env.UPLOAD_PATH ?? '/upload',
    jwtSecret: process.env.JWT_SECRET || 'jwt-secret',
    jwtAccessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    jwtRefreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  }),
);
