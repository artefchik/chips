import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

type Mode = 'development' | 'production';

interface Paths {
    entry: string;
    build: string;
    html: string;
    src: string;
}

interface Env {
    mode: Mode;
    port: number;
}

export default (env: Env) => {
    const paths: Paths = {
        entry: path.resolve(__dirname, 'src', 'index.tsx'),
        build: path.resolve(__dirname, 'build'),
        html: path.resolve(__dirname, 'public', 'index.html'),
        src: path.resolve(__dirname, 'src'),
    };

    const mode = env.mode || 'development';
    const PORT = env.port || 3000;

    const isDevelopment = mode === 'development';
    const isProduction = mode === 'production';

    return {
        mode,
        entry: paths.entry,
        output: {
            filename: '[name].[contenthash].js',
            path: paths.build,
            clean: true,
            publicPath: '/',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: paths.html,
            }),
            ...[
                isProduction &&
                new MiniCssExtractPlugin({
                    filename: 'css/[name].[contenthash:8].css',
                    chunkFilename: 'css/[name].[contenthash:8].css',
                }),
            ],
            ...(isDevelopment
                ? [new webpack.ProgressPlugin(), new ForkTsCheckerWebpackPlugin(), new ReactRefreshWebpackPlugin()]
                : []),
        ],
        module: {
            rules: [
                {
                    test: /\.(png|jpg|jpeg|gif|mp4)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.svg$/i,
                    use: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                icon: true,
                                svgoConfig: {
                                    plugins: [
                                        {
                                            name: 'convertColors',
                                            params: {
                                                currentColor: true,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-typescript',
                                [
                                    '@babel/preset-react',
                                    {
                                        runtime: isDevelopment ? 'automatic' : 'classic',
                                    },
                                ],
                            ],
                        },
                    },
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    auto: (resPath: string) => Boolean(resPath.includes('.module.')),
                                    localIdentName: isDevelopment
                                        ? '[path][name]__[local]--[hash:base64:5]'
                                        : '[hash:base64:8]',
                                },
                            },
                        },
                    ],
                },
            ],
        },
        optimization: {
            minimize: true,
            minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {
                '~': paths.src,
            },
        },
        devtool: isDevelopment ? 'inline-source-map' : undefined,
        devServer: isDevelopment
            ? {
                port: PORT ?? 3000,
                open: false,
                historyApiFallback: true,
                hot: true,
            }
            : undefined,
    };
};
