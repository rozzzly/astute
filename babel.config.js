const envTarget = process.env['TARGET'];
const TARGET = (envTarget && envTarget.toLowerCase() === 'esm') ? 'esm' : 'cjs';

module.exports = (api) => ({
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
        /*
         * Purpose of `module-extension-resolver` here is to append the `.js` extension to
         * module specifiers in `import` expressions and `require` calls. This is necessary
         * for node (v15.0.1) right now because node won't resolve extensions when the
         * native esm loader is in use in the same way that you can with the normal loader.
         * For example, normally (in commonjs) you could write:
         * ```js
         * const { foo } = require('./bar');
         * ```
         * And node will resolve `./bar` into `./bar.js`. But node will not do that (right now)
         * when the esm loader is active. It has to do with interoperability with how browsers
         * handle native esm modules; you don't want the client needing send off a bunch of
         * unnecessary GET requests trying to figure out if `./bar` means `./bar.js` or if you
         * actually want `./bar/index.js`. This makes sense, but is a huge pain and is ugly.
         * There is the flag `--experimental-specifier-resolution=node` which makes specifiers
         * behave how one would expect but this has to be passed to node which is messy and
         * requires the consuming developer to pass that flag to node:
         * ```
         * node --experimental-modules --experimental-specifier-resolution=node ./my-script-with-native-esm-imports.js`
         * ```
         * Hopefully `--experimental-specifier-resolution=node` might one day become the default,
         * but until then, this just bypasses the entire issue by appending the `.js` extension
         * to module specifiers at during transpilation step. This way neither the author or the
         * consumer need do anything different from how we've all been using `import` since 2015.
         */
        (api.env('test')
            ? null // do not include `module-extension-resolver` when jest is in use
            : ['@rozzzly/module-extension-resolver']
        ),
        [
            '@babel/plugin-transform-runtime',
            {
                useESModules: TARGET === 'esm'
            }
        ],
        '@babel/plugin-proposal-class-properties'
    ].filter(plugin => plugin !== null) // filter out any plugins conditionally set to `null`
});
