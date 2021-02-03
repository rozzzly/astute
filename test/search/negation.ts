import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import Source from '../../src/Source';
import { markTags } from '../_simple-tags';

test('.search() with simple .text match and simple .notKind negation', () => {
    const src = new Source(stripIndent`
        <foo>children</foo>
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const [ filtered ] = src.search({ text: '<bar>children</bar>', notKind: 'element.foo.body' });
    expect(filtered.kind).toBe('element.bar');
});

test('.search() with simple .text match and regex .notKind negation', () => {
    const src = new Source(stripIndent`
        <foo>children</foo>
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const [ filtered ] = src.search({ text: '<bar>children</bar>', notKind: /element\.foo(\.body)?/ });
    expect(filtered.kind).toBe('element.bar');
});

