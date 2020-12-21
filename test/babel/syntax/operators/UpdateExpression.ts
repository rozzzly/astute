import { oneLine, stripIndent } from 'common-tags';
import { test, expect } from '@jest/globals';

import BabelSource from '../../../../src/babel/BabelSource';

test('increment a variable (with prefix operator: ++x)', () => {
    const src = new BabelSource(stripIndent`
        let x = 0;
        ++x;
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
    expect(src.breakLines()[1].map(n => n.serialize())).toEqual([
        ['keyword.operator.increment', '++'],
        ['variable.other.readwrite', 'x'],
        ['', ';']
    ]);
});

test('increment a variable (with postfix operator: x++)', () => {
    const src = new BabelSource(stripIndent`
        let x = 0;
        x++;
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
    expect(src.breakLines()[1].map(n => n.serialize())).toEqual([
        ['variable.other.readwrite', 'x'],
        ['keyword.operator.increment', '++'],
        ['', ';']
    ]);
});

test('decrement a variable (with prefix operator: --x)', () => {
    const src = new BabelSource(stripIndent`
        let x = 0;
        --x;
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
    expect(src.breakLines()[1].map(n => n.serialize())).toEqual([
        ['keyword.operator.decrement', '--'],
        ['variable.other.readwrite', 'x'],
        ['', ';']
    ]);
});

test('decrement a variable (with postfix operator: x--)', () => {
    const src = new BabelSource(stripIndent`
        let x = 0;
        x--;
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
    expect(src.breakLines()[1].map(n => n.serialize())).toEqual([
        ['variable.other.readwrite', 'x'],
        ['keyword.operator.decrement', '--'],
        ['', ';']
    ]);
});