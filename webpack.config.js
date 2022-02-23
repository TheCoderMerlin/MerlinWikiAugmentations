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
            "process.env": process.env.ENV === "development" ? JSON.stringify(process.env) : {}
        }),
    ]
};