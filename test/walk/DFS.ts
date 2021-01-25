import { test, expect } from '@jest/globals';
import Source from '../../src/Source';

const setup = () => {
    const src = new Source('one fish-0 two fish-1 red fish-2 blue fish-3', 'test');
    const fishRegExp = /(\S+)\s*(fish-\d)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    return src;
};

test(`.walk() operates in DFS mode by default but can also be specified with { strategy: 'depthFirst' }`, () => {
    const src = setup();

    const selectedImplicit = src.walk(node => (
        node.text.includes('fish')
    ));

    const selectedExplicit = src.walk(node => (
        node.text.includes('fish')
    ), { strategy: 'depthFirst' });

    expect(selectedImplicit.map(node => node.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'fish-0',
        'two fish-1',
        'fish-1',
        'red fish-2',
        'fish-2',
        'blue fish-3',
        'fish-3'
    ]);

    expect(selectedImplicit).toEqual(selectedExplicit);
});

test('walk() in reverse DFS mode', () => {
    const src = setup();

    const selected = src.walk((node, handle) => (
        node.text.includes('fish')
    ), { reverse: true });

    expect(selected.map(node => node.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'fish-3',
        'red fish-2',
        'fish-2',
        'two fish-1',
        'fish-1',
        'one fish-0',
        'fish-0',
    ]);
});

test('.walk() in DFS mode with a limit', () => {
    const src = setup();

    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { limit: 4 });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'fish-0',
        'two fish-1',
    ]);
});

test('.walk() in reverse DFS mode with a limit', () => {
    const src = setup();

    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { reverse: true, limit: 4 });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'fish-3',
        'red fish-2',
    ]);
});


test('.skipSiblings() in DFS mode on a terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'one',
        'fish-0',
        'two fish-1',
        'two',
        'red fish-2',
        'red',
        'fish-2',
        'blue fish-3',
        'blue',
        'fish-3'
    ]);
});
test('.skipSiblings() in reverse DFS mode on a terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { reverse: true });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'fish-3',
        'blue',
        'red fish-2',
        'fish-2',
        'red',
        'two fish-1',
        'fish-1',
        'one fish-0',
        'fish-0',
        'one'
    ]);
});

test('.skipSiblings() in DFS mode on a non-terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') {
            walker.skipSiblings();
        }
        return node.text !== ' '; // make expect a little shorter
    });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'one',
        'fish-0',
        'two fish-1',
        'two',
        'fish-1'
    ]);
});

test('.skipSiblings() in reverse DFS mode on a non-terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { reverse: true });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'fish-3',
        'blue',
        'red fish-2',
        'fish-2',
        'red',
        'two fish-1',
        'fish-1',
        'two'
    ]);
});

test('.skipChildren() in DFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipChildren();
        return node.text !== ' '; // make expect a little shorter
    });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'one',
        'fish-0',
        'two fish-1',
        'red fish-2',
        'red',
        'fish-2',
        'blue fish-3',
        'blue',
        'fish-3'
    ]);
});
test('.skipChildren() in reverse DFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipChildren();
        return node.text !== ' '; // make expect a little shorter
    }, { reverse: true });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'fish-3',
        'blue',
        'red fish-2',
        'fish-2',
        'red',
        'two fish-1',
        'one fish-0',
        'fish-0',
        'one',
    ]);
});

test('.abort() in DFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'one') walker.abort();
        return node.text !== ' '; // make expect a little shorter
    });
    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'one',
    ]);
});

test('.collect() in DFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (/[aeiou]$/.test(node.text)) {
            walker.collect();
        }
    });
    expect(selected.map(n => n.text)).toEqual([
        'one',
        'two',
        'blue'
    ]);
});