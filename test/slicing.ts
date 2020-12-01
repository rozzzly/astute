import { test, expect } from '@jest/globals';

import Source from '../src/Source';
import ScopeNode from '../src/ScopeNode';

test('.find() throws with invalid or out of bounds ranges', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.locate(3, 1)).toThrow();
    expect(() => src.locate(7, 10)).toThrow();
    expect(() => src.locate(-1, 1)).toThrow();
});

test('.slice() throws with invalid or out of bounds ranges', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.slice(3, 1)).toThrow();
    expect(() => src.slice(7, 10)).toThrow();
    expect(() => src.slice(-1, 1)).toThrow();
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

test(`zero-width .slice() will throw if 'includeAdjacent' is not passed as 'true'`, () => {
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

test(`slicing a ScopeNode will result in derivative ScopeNodes with the same 'kind'`, () => {
    const src = new Source('hello world', 'test');
    expect(src.serialize()).toEqual(['source.test', [
        ['', 'hello world']
    ]]);
    src.children[0].kind = 'foobar';
    expect(src.serialize()).toEqual(['source.test', [
        ['foobar', 'hello world']
    ]]);
    const start = src.text.indexOf(' ');
    src.slice(start, start + 1);
    expect(src.serialize()).toEqual(['source.test', [
        ['foobar', 'hello'],
        ['foobar', ' '],
        ['foobar', 'world']
    ]]);
});

test('using .slice() to slice up children of root node', () => {
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

test('a ScopeNode is created as the sole child of a Source when it is created', () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    expect(src.children.length).toBe(1);
    expect(src.children[0]).toBeInstanceOf(ScopeNode);
    expect(src.children[0].text).toBe('one fish two fish red fish blue fish');
});