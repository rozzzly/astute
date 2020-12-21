import { test, expect } from '@jest/globals';
import BabelSource from '../../../../src/babel/BabelSource';

test('(implicitly) positive integer', () => {
    const src = new BabelSource('2', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['constant.numeric.decimal', '2']
    ]]);
});
test('(explicitly) positive integer', () => {
    const src = new BabelSource('+2', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '+'],
        ['constant.numeric.decimal', '2']
    ]]);
});
test('negative integer', () => {
    const src = new BabelSource('-2', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '-'],
        ['constant.numeric.decimal', '2']
    ]]);
});
test('(implicitly) positive float', () => {
    const src = new BabelSource('3.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['constant.numeric.decimal', [
            ['', '3'],
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('(implicitly) positive float omitting int', () => {
    const src = new BabelSource('.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['constant.numeric.decimal', [
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('(implicitly) positive float omitting frac', () => {
    const src = new BabelSource('.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['constant.numeric.decimal', [
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('(explicitly) positive float', () => {
    const src = new BabelSource('+3.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '+'],
        ['constant.numeric.decimal', [
            ['', '3'],
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('(explicitly) positive float omitting int', () => {
    const src = new BabelSource('+.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '+'],
        ['constant.numeric.decimal', [
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('(explicitly) positive float omitting frac', () => {
    const src = new BabelSource('+3.', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '+'],
        ['constant.numeric.decimal', [
            ['', '3'],
            ['meta.delimiter.decimal.period', '.']
        ]]
    ]]);
});
test('negative float', () => {
    const src = new BabelSource('-3.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '-'],
        ['constant.numeric.decimal', [
            ['', '3'],
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('negative float omitting int', () => {
    const src = new BabelSource('-.5', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '-'],
        ['constant.numeric.decimal', [
            ['meta.delimiter.decimal.period', '.'],
            ['', '5']
        ]]
    ]]);
});
test('negative float omitting frac', () => {
    const src = new BabelSource('-3.', 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual(['source.ts', [
        ['keyword.operator.arithmetic', '-'],
        ['constant.numeric.decimal', [
            ['', '3'],
            ['meta.delimiter.decimal.period', '.']
        ]]
    ]]);
});