import { test, expect } from '@jest/globals';

import Source from '../src/Source';

test('Using .walk() to mark certain elements children what were sliced hierarchically sliced by .findSliceAndBranch()', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    src.walk(node => {
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
        }
    });
    expect(src.children.length).toBe(7);
    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', [
            ['adjective', 'one'],
            ['whitespace', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'two'],
            ['whitespace', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'red'],
            ['whitespace', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'blue'],
            ['whitespace', ' '],
            ['noun', 'fish']
        ]]
    ]]);
});
