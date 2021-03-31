import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import BabelSource from '../../../../src/babel/BabelSource';

test('simple ObjectExpression with single property', () => {
    const src = new BabelSource(stripIndent`
        let x = {
            foo: 'bar'
        }
    `, 'ts');
    src.tokenize();
    const [ node ] = src.search({ kind: 'meta.objectliteral' });
    expect(node.serialize()).toEqual(['meta.objectliteral', [
        ['punctuation.definition.block', '{'],
        ['', '\n    '],
        ['meta.object.member', [
            ['meta.object-literal.key', [
                ['', 'foo'],
                ['punctuation.separator.key-value', ':']
            ]],
            ['', ' '],
            ['string.quoted.single', [
                ['punctuation.definition.string.start', '\''],
                ['', 'bar'],
                ['punctuation.definition.string.end', '\'']
            ]]
        ]],
        ['', '\n'],
        ['punctuation.definition.block', '}']
    ]]);
});

test('simple ObjectExpression with multiple properties', () => {
    const src = new BabelSource(stripIndent`
        let x = {
            foo: 'bar',
            one: 2,
            7: 'seven'
        }
    `, 'ts');
    src.tokenize();
    const nodes = src.search({ kind: 'meta.object-literal.key' });
    expect(nodes.length).toBe(3);
    expect(nodes.map(n => n.text)).toEqual([
        'foo:',
        'one:',
        '7:'
    ]);
    expect(nodes[1].scopes).toEqual([
        'meta.object-literal.key',
        'meta.object.member',
        'meta.objectliteral',
        'meta.var.expr',
        'source.ts'
    ]);
    expect(nodes[1].serialize()).toEqual([
        'meta.object-literal.key', [
            ['', 'one'],
            ['punctuation.separator.key-value', ':']
        ]
    ]);
    expect(nodes[2].serialize()).toEqual([
        'meta.object-literal.key', [
            ['', '7'],
            ['punctuation.separator.key-value', ':']
        ]
    ]);
});

test('ObjectExpression with a computed property name', () => {
    const src = new BabelSource(stripIndent`
        const FOO = Symbol();
        const bar = 'bar';
        let x = {
            [FOO]: 'bar',
            [bar + 4]: 3,
            [5]: five
        }
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('ObjectExpression with a shorthand property', () => {
    const src = new BabelSource(stripIndent`
        const bar = 'bar';
        let x = {
            foo: 'foo',
            bar
        }
    `, 'ts');
    src.tokenize();
    const nodes = src.search({ kind: 'meta.object.member' });
    expect(nodes.map(n => n.serialize())).toEqual([
        ['meta.object.member', [
            ['meta.object-literal.key', [
                ['', 'foo'],
                ['punctuation.separator.key-value', ':']
            ]],
            ['', ' '],
            ['string.quoted.single', [
                ['punctuation.definition.string.start', '\''],
                ['', 'foo'],
                ['punctuation.definition.string.end', '\'']
            ]]
        ]],
        ['meta.object.member', [
            ['variable.other.readwrite', 'bar']
        ]]
    ]);
});