import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import BabelSource from '../../../src/babel/BabelSource';

test('default import', () => {
    const src = new BabelSource(stripIndent`
        import FooBar from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('named imports', () => {
    const src = new BabelSource(stripIndent`
        import { Foo, Bar } from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('aliased import', () => {
    const src = new BabelSource(stripIndent`
        import { Foo as Bar } from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('aliased default import', () => {
    const src = new BabelSource(stripIndent`
        import { default as FooBar } from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('namespace import', () => {
    const src = new BabelSource(stripIndent`
        import * as FooBar from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});

test('mixed named and default import', () => {
    const src = new BabelSource(stripIndent`
        import FooBar, { Foo, Bar } from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});
test('mixed default, named, aliased, and aliased default imports', () => {
    const src = new BabelSource(stripIndent`
        import FooBar, { Foo, Bar as Baz, default as BarFoo } from './FooBar';
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toMatchSnapshot();
});