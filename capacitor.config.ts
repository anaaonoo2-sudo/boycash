import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boycash.app',
  appName: 'BoyCash',
  webDir: 'dist',
  server: {
    url: "https://boycash.vercel.app",
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'boycash.vercel.app',
      'boycash-dc4e4.firebaseapp.com',
      'boycash-dc4e4.web.app',
      'accounts.google.com',
      '*.google.com',
      '*.googleapis.com'
    ]
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false
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
