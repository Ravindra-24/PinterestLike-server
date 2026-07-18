const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
    entry:'./src/index.js',
    output:{
        filename:'bundle.cjs',
        path:path.resolve(__dirname,'dist')
    },
    target:'node',
    externalsPresets: { node: true },
    externals: [({ request }, callback) => {
        if (request && !request.startsWith('.') && !path.isAbsolute(request)) {
            return callback(null, `commonjs ${request}`);
        }
        callback();
    }],
    module:{
        rules:[
            {
                test:/\.js$/,
                loader:'babel-loader',
                exclude:/node_modules/,
            }
        ]
    },
    devtool:'source-map',
    plugins:[
        new NodemonPlugin()
    ]
}
