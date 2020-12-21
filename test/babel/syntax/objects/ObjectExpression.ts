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
    expect(src.serialize()).toMatchSnapshot();
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
    expect(src.serialize()).toMatchSnapshot();
});

test('ObjectExpression with a computed property names', () => {
    const src = new BabelSource(stripIndent`
        const FOO = Symbol();
        const bar = 'bar';
        let x = {
            [FOO]: 'bar',
            [bar + 4]: 3
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
    expect(src.serialize()).toMatchSnapshot();
});