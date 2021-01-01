import { test, expect } from '@jest/globals';
import { oneLine } from 'common-tags';

import Source from '../src/Source';

test('using .walk() to mark nodes matching a predicate', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', [
            ['adjective', 'one'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['', ' '],
        ['phrase', [
            ['adjective', 'two'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['', ' '],
        ['phrase', [
            ['adjective', 'red'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['', ' '],
        ['phrase', [
            ['adjective', 'blue'],
            ['', ' '],
            ['noun', 'fish']
        ]]
    ]]);
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

test(`using .walk() visitor's walker.abort() to prematurely abort walk process`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.slice(match.index, match.index + match[0].length).kind = 'phrase';
    }
    let count = 0;
    src.walk((node, handle) => {
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
            if (++count >= 2) { // only mark first 2 whitespaces
                handle.abort();
            }
        }
    });
    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', 'one fish'],
        ['whitespace', ' '],
        ['phrase', 'two fish'],
        ['whitespace', ' '],
        ['phrase', 'red fish'],
        ['', ' '],
        ['phrase', 'blue fish']
    ]]);
});

test(`using a .walk() visitor's walker.abort() causes the early exit to bubble up from nested nodes all the way to the root`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    let count = 0;
    src.walk((node, handle) => {
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
            if (++count >= 3) { // only mark first 3 whitespaces
                handle.abort();
            }
        }
    });
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
        ['', ' '],
        ['phrase', [
            ['adjective', 'red'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['', ' '],
        ['phrase', [
            ['adjective', 'blue'],
            ['', ' '],
            ['noun', 'fish']
        ]]
    ]]);
});

test(`using a .walk() visitor's walker.skipChildren() to prevent walker from going deeper`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    src.walk((node, handle) => {
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
        } else if (node.depth > 0) { // only mark first 2 whitespaces
            handle.skipChildren();
        }
    });
    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', [
            ['adjective', 'one'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'two'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'red'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'blue'],
            ['', ' '],
            ['noun', 'fish']
        ]]
    ]]);
});

test(oneLine`
    using a .walk() visitor's walker.skipSiblings() to prevent any siblings of the current node from being
    walked (while still walking the children of the current node)
`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    src.walk((node, handle) => {
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
        } else if (node.depth > 0) { // only mark first 2 whitespaces
            handle.skipChildren();
        }
    });
    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', [
            ['adjective', 'one'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'two'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'red'],
            ['', ' '],
            ['noun', 'fish']
        ]],
        ['whitespace', ' '],
        ['phrase', [
            ['adjective', 'blue'],
            ['', ' '],
            ['noun', 'fish']
        ]]
    ]]);
});

test(`using a .walk() visitor's walker.collect() to filter out a subset of ScopeNodes`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    const selected = src.walk((node, handle) => {
        node.text.match(/[aeiou]$/i) && handle.collect();
    });

    expect(selected.map(node => node.text)).toEqual([
        'one', 'two', 'blue'
    ]);
});

test('.walk() in BFS mode - walker.skipChildren()', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    src.walk((node, walker) => {
        if (node.depth > 0 && node.text.includes('red')) walker.skipChildren();
        if (node.isTerminal && /^\s+$/g.test(node.text)) {
            node.kind = 'whitespace';
        }
    }, { strategy: 'breadthFirst' });
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
            ['', ' '],
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