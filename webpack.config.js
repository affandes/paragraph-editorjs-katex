const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'paragraph-katex-editor.js',
        library: 'ParagraphKatexEditor',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    externals: {
        'katex/katex': {
            commonjs: 'katex',
            commonjs2: 'katex',
            amd: 'katex',
            root: 'katex',
        }
    },
    devServer: {
        contentBase: './dist'
    }
};