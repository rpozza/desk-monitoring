const path = require("path");
const myconf = require("./config.json")
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const outputDirectory = "dist";

var config = {
    entry: "./src/client/index.js",
    output: {
        path: path.join(__dirname, outputDirectory),
        filename: "bundle.js"
    },
    module:{
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015', 'react']
                    }    
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg)$/,
                loader: "url-loader?limit=100000"
            }
        ]
    },
    devServer: {
        inline: true,
        host: '0.0.0.0',
        https: true,
        port: myconf.clientPort,
        proxy: {
            "/api" : "http://localhost:" + myconf.serverPort
        }
    },
    devtool: 'inline-source-map',
    plugins: [
        new CleanWebpackPlugin([outputDirectory]),
        new HtmlWebpackPlugin({
          template: "./public/index.html",
          favicon: "./public/favicon.ico"
        })
    ]
}
module.exports = config;