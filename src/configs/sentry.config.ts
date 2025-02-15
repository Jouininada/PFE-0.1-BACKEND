import { registerAs } from '@nestjs/config';

export default registerAs(
  'sentry',
  (): Record<string, any> => ({
    dsn:
      process.env.SENTRY_DSN ??
      'https://examplePublicKey@o0.ingest.sentry.io/0',
  }),
);
