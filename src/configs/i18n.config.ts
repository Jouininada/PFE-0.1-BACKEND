import { registerAs } from '@nestjs/config';

export default registerAs(
  'i18n',
  (): Record<string, any> => ({
    language: process.env.APP_LANGUAGE ?? 'en',
  }),
);
