module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                    browsers: [
                        'last 2 versions'
                    ]
                },
                modules: 'commonjs'
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties'
    ]
};
