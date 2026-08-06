import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillexchange.app',
  appName: 'SkillSwap Exchange',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B0F19',
      showSpinner: true,
      androidSpinnerStyle: 'large'
    }
  }
};

export default config;
