import { registerAs } from '@nestjs/config';

export default registerAs(
  'app-preferences',
  (): Record<string, any> => ({
    currency: { fav1: 'USD', fav2: 'EUR', fav3: 'TND' },
  }),
);
