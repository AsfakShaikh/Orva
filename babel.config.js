module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@helpers': './src/helpers',
          '@hooks': './src/hooks',
          '@locales': './src/locales',
          '@modules': './src/modules',
          '@nativeModules': './src/nativeModules',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@styles': './src/styles',
          '@utils': './src/utils',
          // Match the aliases you set in tsconfig.json
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
