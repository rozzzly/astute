module.exports = {
    testEnvironment: 'node',
    testRunner: 'jest-circus/runner',
    snapshotSerializers: [
        '<rootDir>/test/_helpers/scopeNodeSerializer.js'
    ],
    snapshotResolver: '<rootDir>/test/_helpers/snapshotResolver.js',
    injectGlobals: false,
    verbose: true,
    testRegex: [
        // EITHER - any file in `./test` or `./__tests__` that:
        //  1) has the extension .ts`, `.js`, `.tsx`, or `.jsx`
        //  2) and does not have a file name, or parent folder name that starts with `_` (not including `__tests__`)
        //  examples:
        //    /home/rozzzly/dev/astute/test/something.ts MATCH
        //    /home/rozzzly/dev/astute/test/_some-helper.ts NO MATCH
        //    /home/rozzzly/dev/astute/test/snake_case.ts MATCH
        //    /home/rozzzly/dev/astute/test/__mocks__/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/test/_helpers/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/something.ts MATCH
        //    /home/rozzzly/dev/astute/__tests__/_some-helper.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/snake_case.ts MATCH
        //    /home/rozzzly/dev/astute/__tests__/__mocks__/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/_helpers/something.ts NO MATCH
        /(?:test|__tests__)(?:\/[^_][^/]+)*\/[^_][^/]*\.(?:t|j)sx?$/,
        // OR - any file in `./test` or `./__tests__` that:
        //  1) has the extension is `.ts`, `.js`, `.tsx`, or `.jsx`
        //  2) has a file name (before the extension) which ends with the suffix `.test` or `.spec`
        //
        //  << Note >> This test does not care about file/folder names that begin with `_` this is actually here
        //  specifically so tests can be written for (and colocated) with those helper files.
        //
        //  examples:
        //    /home/rozzzly/dev/astute/test/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/test/something.test.ts MATCH
        //    /home/rozzzly/dev/astute/test/_some-helper.ts NO MATCH
        //    /home/rozzzly/dev/astute/test/_some-helper.spec.ts MATCH
        //    /home/rozzzly/dev/astute/test/__mocks__/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/test/__mocks__/something.test.ts MATCH
        //    /home/rozzzly/dev/astute/__tests__/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/something.spec.ts MATCH
        //    /home/rozzzly/dev/astute/__tests__/_some-helper.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/_some-helper.test.ts MATCH
        //    /home/rozzzly/dev/astute/__tests__/__mocks__/something.ts NO MATCH
        //    /home/rozzzly/dev/astute/__tests__/__mocks__/something.spec.ts MATCH
        /(?:test|__tests__)(?:\/[^/]+)*\/[^/]*\.(?:test|spec)\.(?:t|j)sx?$/,
    ]
};
