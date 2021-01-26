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

test('.walk() in BFS mode', () => {
    const src = setup();

    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { strategy: 'breadthFirst'});

    expect(selected.map(node => node.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'red fish-2',
        'blue fish-3',
        'fish-0',
        'fish-1',
        'fish-2',
        'fish-3'
    ]);
});

test('.walk() in reverse BFS mode', () => {
    const src = setup();

    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { strategy: 'breadthFirst', reverse: true });

    expect(selected.map(node => node.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'red fish-2',
        'two fish-1',
        'one fish-0',
        'fish-3',
        'fish-2',
        'fish-1',
        'fish-0',
    ]);
});

test('.walk() in BFS mode with a limit', () => {
    const src = setup();

    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { strategy: 'breadthFirst', limit: 4 });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'red fish-2'
    ]);
});

test('.walk() in reverse BFS mode with a limit', () => {
    const src = setup();
    const selected = src.walk(node => (
        node.text.includes('fish')
    ), { strategy: 'breadthFirst', reverse: true, limit: 4 });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'red fish-2',
        'two fish-1'
    ]);
});

test('.skipSiblings() in BFS mode on a terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst' });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'red fish-2',
        'blue fish-3',
        'one',
        'fish-0',
        'two',
        'red',
        'fish-2',
        'blue',
        'fish-3'
    ]);
});

test('.skipSiblings() in reverse BFS mode on a terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst', reverse: true });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'red fish-2',
        'two fish-1',
        'one fish-0',
        'fish-3',
        'blue',
        'fish-2',
        'red',
        'fish-1',
        'fish-0',
        'one'
    ]);
});

test('.skipSiblings() in BFS mode on non-terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst' });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'two',
        'fish-1'
    ]);
});


test('.skipSiblings() in BFS mode on a non-terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst' });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'two',
        'fish-1'
    ]);
});

test('.skipSiblings() in reverse BFS mode on a non-terminal ScopeNode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipSiblings();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst', reverse: true });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'red fish-2',
        'two fish-1',
        'fish-1',
        'two'
    ]);
});


test('.skipChildren() in BFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipChildren();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst' });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'red fish-2',
        'blue fish-3',
        'one',
        'fish-0',
        'red',
        'fish-2',
        'blue',
        'fish-3'
    ]);
});
test('.skipChildren() in reverse BFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'two fish-1') walker.skipChildren();
        return node.text !== ' '; // make expect a little shorter
    }, { reverse: true, strategy: 'breadthFirst' });

    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'blue fish-3',
        'red fish-2',
        'two fish-1',
        'one fish-0',
        'fish-3',
        'blue',
        'fish-2',
        'red',
        'fish-0',
        'one',
    ]);
});

test('.abort() in BFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text === 'one') walker.abort();
        return node.text !== ' '; // make expect a little shorter
    }, { strategy: 'breadthFirst' });
    expect(selected.map(n => n.text)).toEqual([
        'one fish-0 two fish-1 red fish-2 blue fish-3',
        'one fish-0',
        'two fish-1',
        'red fish-2',
        'blue fish-3',
        'one',
    ]);
});

test('.collect() in BFS mode', () => {
    const src = setup();
    const selected = src.walk((node, walker) => {
        if (node.text.startsWith('blue')) walker.collect();
        if (/[aeiou]$/.test(node.text)) walker.collect();
    }, { strategy: 'breadthFirst' });
    expect(selected.map(n => n.text)).toEqual([
        'blue fish-3',
        'one',
        'two',
        'blue',
        'blue'
    ]);
});
