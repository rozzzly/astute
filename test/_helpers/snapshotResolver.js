module.exports = {
    resolveSnapshotPath: (testPath, ext) => (
        testPath.replace('/test/', '/test/_snapshots/') + ext
    ),
    resolveTestPath: (snapshotPath, ext) => (
        snapshotPath.replace('/test/_snapshots/', '/test/').slice(0, -ext.length)
    ),
    testPathForConsistencyCheck: '/test/branching.ts',
};