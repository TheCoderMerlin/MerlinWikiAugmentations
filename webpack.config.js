const path = require("path");
const webpack = require("webpack");
require("dotenv").config();

module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            }
        ],
    },
    watch: process.env.ENV === "development",
    mode: process.env.ENV,
    entry: {
        augmentations: "./src/app.js",
        testing: "./src/testing.js"
    },
    output: {
        filename: "[name].js",
        path: __dirname + '/dist',
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": process.env.env === "development" ? JSON.stringify(process.env) : {}
        }),
    ]
};