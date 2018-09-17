const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const sfcPlugin = require('./index')

const dirHTML = path.resolve(__dirname, 'bench', 'html');

module.exports = {
  entry: './bench/js/main.tsx',
  output: {
    filename: '[name].js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [sfcPlugin()],
          }),
          compilerOptions: {
            module: 'esnext',
          },
        },
        exclude: /node_modules/,
      }
    ],
  },

  mode: 'production',

  plugins: [
    new CopyWebpackPlugin([
      { from: dirHTML }
    ]),
  ]
}
