import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import BabelSource from '../../../../src/babel/BabelSource';

test('a bare ArrayExpression with two items', () => {
    const src = new BabelSource(stripIndent`
        [3, 'hello']
    `, 'ts');
    src.tokenize();
    const [ arr ] = src.search({ kind: 'meta.array.literal' });
    expect(arr.serialize()).toEqual(['meta.array.literal', [
        ['meta.brace.square', '['],
        ['constant.numeric.decimal', '3'],
        ['punctuation.separator.comma', ','],
        ['', ' '],
        ['string.quoted.single', [
            ['punctuation.definition.string.start', '\''],
            ['', 'hello'],
            ['punctuation.definition.string.end', '\'']
        ]],
        ['meta.brace.square', ']']
    ]]);
});

test('an ArrayExpression that consumes leading whitespace', () => {
    const src = new BabelSource(stripIndent`
        let whatever = [3, 'hello'];
    `, 'ts');
    src.tokenize();
    const [ arr ] = src.search({ kind: 'meta.array.literal' });
    expect(arr.serialize(1)).toEqual(['meta.array.literal', [
        ['', ' '], // leading whitespace
        ['meta.brace.square', '['],
        ['constant.numeric.decimal', '3'],
        ['punctuation.separator.comma', ','],
        ['', ' '],
        ['string.quoted.single', '... omitted ...'],
        ['meta.brace.square', ']']
    ]]);
});