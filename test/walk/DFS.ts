import { test, expect } from '@jest/globals';
import { oneLine } from 'common-tags';
import Source from '../../src/Source';

test('.walk() operates in BFS mode when BFS{} ', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    let match, fishRegExp = /(\S+)\s*(fish)/g;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }

    const selected = src.walk((node, walker) => node.text.length === 3 || node.text.length === 4);

    expect(selected.map(node => node.text)).toEqual([
        'one',
        'fish',
        'two',
        'fish',
        'red',
        'fish',
        'blue',
        'fish'
    ]);
});