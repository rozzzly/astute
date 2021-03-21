import { test, expect } from '@jest/globals';

import Source from '../src/Source';
import ScopeNode from '../src/ScopeNode';

test('.locate() throws when range is invalid or out of bounds', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.locate(3, 1)).toThrow();
    expect(() => src.locate(7, 10)).toThrow();
    expect(() => src.locate(-1, 1)).toThrow();
});
test('.slice() using a range that is with out of bounds', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.sliceAndBranch(3, 1)).toThrow();
    expect(() => src.sliceAndBranch(7, 10)).toThrow();
    expect(() => src.sliceAndBranch(-1, 1)).toThrow();
});
test('.sliceAndBranch() using a range that is with out of bounds', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.sliceAndBranch(3, 1)).toThrow();
    expect(() => src.sliceAndBranch(7, 10)).toThrow();
    expect(() => src.sliceAndBranch(-1, 1)).toThrow();
});

test('.slice() at the start of text', () => {
    const src = new Source('foobar', 'test');
    expect(src.slice(0, 3).text).toBe('foo');
    expect(src.children.length).toBe(2);
    expect(src.children[0].text).toBe('foo');
    expect(src.children[1].text).toBe('bar');
});
test('.slice() at the end of text', () => {
    const src = new Source('foobar', 'test');
    expect(src.slice(3, 6).text).toBe('bar');
    expect(src.children.length).toBe(2);
    expect(src.children[0].text).toBe('foo');
    expect(src.children[1].text).toBe('bar');
});
test('.slice() in the middle of text', () => {
    const src = new Source('foobar', 'test');
    expect(src.slice(2, 4).text).toBe('ob');
    expect(src.children.length).toBe(3);
    expect(src.children[0].text).toBe('fo');
    expect(src.children[1].text).toBe('ob');
    expect(src.children[2].text).toBe('ar');
});
test('zero-width .slice() is prohibited', () => {
    expect(() => {
        const src = new Source('foobar', 'test');
        const group = src.slice(3, 3);
    }).toThrow();
    const src = new Source('foobar', 'test');
    const group = src.slice(3, 3, true);
    expect(group).toEqual({ head: expect.anything(), tail: expect.anything()});
    expect(src.children.length).toBe(2);
    expect(src.children[0].text).toBe('foo');
    expect(src.children[1].text).toBe('bar');
});

test('A Source is created with a single untagged ScopeNode as its child', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    expect(src.children.length).toBe(1);
    expect(src.children[0]).toBeInstanceOf(ScopeNode);
    expect(src.children[0].kind).toBe('');
    expect(src.children[0].text).toBe('one fish two fish red fish blue fish');
});

test('Using .slice() to slice up children of root node', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /fish/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.slice(match.index, match.index + match[0].length).kind = 'noun';
    }
    expect(src.children.length).toBe(8);
    expect(src.serialize()).toEqual(['source.test', [
        ['', 'one '],
        ['noun', 'fish'],
        ['', ' two '],
        ['noun', 'fish'],
        ['', ' red '],
        ['noun', 'fish'],
        ['', ' blue '],
        ['noun', 'fish']
    ]]);
});

test('Using .sliceAndBranch() to slice up children of the root node hierarchically', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length).kind = 'phrase';
        src.slice(match.index, match.index + match[1].length).kind = 'adjective';
        src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length).kind = 'noun';
    }
    expect(src.children.length).toBe(7);
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
});

test('Using .walk() to mark certain nodes what were sliced hierarchically sliced by .findSliceAndBranch()', () => {
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
