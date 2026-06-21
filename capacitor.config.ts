import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boycash.app',
  appName: 'BoyCash',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    adjustResize: true
  },
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.googleapis.com',
      '*.google.com',
      'generativelanguage.googleapis.com'
    ]
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '367328224851-me4jp2lg5bplvc4ko6ajlerqne2agns6.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
