import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';

import { markTags } from './_simple-tags';
import Source from '../src/Source';

test('.sliceAndBranch() throws with invalid or out of bounds ranges', () => {
    const src = new Source('foobar', 'test');
    expect(() => src.sliceAndBranch(3, 1)).toThrow();
    expect(() => src.sliceAndBranch(7, 10)).toThrow();
    expect(() => src.sliceAndBranch(-1, 1)).toThrow();
});

test(`children created with .findSliceAndBranch() do not inherit their 'kind' from their parent`, () => {
    const src = new Source('one fish two fish red fish blue fish', 'test');
    const fishRegExp = /(\S+)\s*(fish)/g;
    let match;
    src.children[0].kind = 'phrase';

    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', 'one fish two fish red fish blue fish']
    ]]);

    while (match = fishRegExp.exec(src.text)) {
        src.sliceAndBranch(match.index, match.index + match[0].length);
        // src.slice(match.index, match.index + match[1].length);
        // src.slice(match.index + match[0].length - match[2].length, match.index + match[0].length)
    }

    expect(src.serialize()).toEqual(['source.test', [
        ['phrase', [
            ['', 'one fish']
        ]],
        ['phrase', ' '],
        ['phrase', [
            ['', 'two fish']
        ]],
        ['phrase', ' '],
        ['phrase', [
            ['', 'red fish']
        ]],
        ['phrase', ' '],
        ['phrase', [
            ['', 'blue fish']
        ]]
    ]]);
});

test('Using .sliceAndBranch() to slice up children of root node hierarchically', () => {
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

test('using .findSliceAndBranch() to slice text into a complex scope tree', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');

    markTags(src);
    expect(src.serialize()).toEqual(['source.test', [
        ['element.foo', [
            ['tag.foo.open', '<foo>'],
            ['element.foo.body', [
                ['element.bar', [
                    ['tag.bar.open', '<bar>'],
                    ['element.bar.body', [
                        ['', 'double nested']
                    ]],
                    ['tag.bar.close', '</bar>']
                ]]
            ]],
            ['tag.foo.close', '</foo>']
        ]],
        ['', '\n'],
        ['element.foo', [
            ['tag.foo.open', '<foo>'],
            ['element.foo.body', [
                ['', '\n    '],
                ['element.bar', [
                    ['tag.bar.open', '<bar>'],
                    ['element.bar.body', [
                        ['', 'multiple']
                    ]],
                    ['tag.bar.close', '</bar>']
                ]],
                ['', '\n    '],
                ['element.bar', [
                    ['tag.bar.open', '<bar>'],
                    ['element.bar.body', [
                        ['', 'children']
                    ]],
                    ['tag.bar.close', '</bar>']
                ]],
                ['', '\n'],
            ]],
            ['tag.foo.close', '</foo>']
        ]],
    ]]);
});