const envTarget = process.env['TARGET'];
const TARGET = (envTarget && envTarget.toLowerCase() === 'esm') ? 'esm' : 'cjs';

module.exports = {
    sourceMaps: 'inline',
    presets: [
        [
            '@babel/preset-env',
            (TARGET === 'esm') ? {
                targets: {
                    esmodules: true,
                    node: 'current'
                },
                modules: false
            } : {
                modules: 'commonjs',
                targets: {
                    node: '8.9.0'
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    plugins: [
        [
            '@babel/plugin-transform-runtime',
            {
                useESModules: TARGET === 'esm'
            }
        ],
        '@babel/plugin-proposal-class-properties'
    ]
};
