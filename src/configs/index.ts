import AppConfig from './app.config';
import DatabaseConfig from './database.config';
import DocConfig from './doc.config';
import i18nConfig from './i18n.config';
import SentryConfig from './sentry.config';
import AppPreferencesConfig from './app-preference.config';
export default [
  AppConfig,
  AppPreferencesConfig,
  DatabaseConfig,
  DocConfig,
  i18nConfig,
  SentryConfig,
];
