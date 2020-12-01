import { test, expect } from '@jest/globals';
import { oneLine, stripIndent } from 'common-tags';
import Source from '../src/Source';
import { markTags } from './_simple-tags';


const newline = ['newline', '\n'];

test('source.breakLines() returns an array where each element is an array of the ScopeNodes on that line (omitting line breaks)', () => {
    const src = new Source(stripIndent`
        one two
        three
        four five six
    `, 'test');

    // slice a node for each word
    const wordRegExp = /(\w+)/g;
    let match;
    while (match = wordRegExp.exec(src.text)) {
        src.slice(match.index, match.index + match[1].length).kind = 'word';
    }
    // mark whitespace
    src.walk((node) => {
        if (/^\s+$/.test(node.text)) {
            node.kind = 'whitespace';
        }
    });

    const lines = src.breakLines();
    const serializedLines = lines.map(line => (
        line.map(node => node.serialize())
    ));
    expect(serializedLines).toEqual([
        [
            ['word', 'one'],
            ['whitespace', ' '],
            ['word', 'two']
        ], [
            ['word', 'three']
        ], [
            ['word', 'four'],
            ['whitespace', ' '],
            ['word', 'five'],
            ['whitespace', ' '],
            ['word', 'six']
        ]
    ]);

});

test('using source.breakLines() to split up text into multiple lines', () => {
    const src = new Source(stripIndent`
        One line.
        Two line.
        Three line.
        Four.
    `, 'test');
    src.breakLines();
    expect(src.serialize()).toEqual(['source.test', [
        ['', 'One line.'],
        newline,
        ['', 'Two line.'],
        newline,
        ['', 'Three line.'],
        newline,
        ['', 'Four.'],
    ]]);
});

test('using source.breakLines() to split up a complex scope tree at each line break into "scope tree cross sections" ', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            multi
            line!
        </foo>
    `, 'test');

    markTags(src);
    src.breakLines();
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
        newline,
        ['element.foo', [
            ['tag.foo.open', '<foo>']
        ]],
        newline,
        ['element.foo', [
            ['element.foo.body', [
                ['', '    multi']
            ]],
        ]],
        newline,
        ['element.foo', [
            ['element.foo.body', [
                ['', '    line!']
            ]],
        ]],
        newline,
        ['element.foo', [
            ['tag.foo.close', '</foo>']
        ]]
    ]]);
});