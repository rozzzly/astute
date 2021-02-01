import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import Source from '../../src/Source';
import { markTags } from '../_simple-tags';

test('.search() with simple .text match and .notKind negation', () => {
    const src = new Source(stripIndent`
        <foo>children</foo>
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const [filtered] = src.search({ text: 'children', notKind: ['element.foo.body', ''] });
    expect(filtered.kind).toBe('element.bar.body');
});

