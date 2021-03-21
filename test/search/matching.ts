import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import Source from '../../src/Source';
import { markTags } from '../_simple-tags';

test('.search() with a simple .text match', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const [ filtered ] = src.search({ text: 'multiple' });
    expect(filtered.parent?.text).toBe('<bar>multiple</bar>');
});

test('.search() with a regex .text match', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({ text: /^<\/?bar>/ });
    expect(filtered.map(n => n.text)).toEqual([
        '<bar>double nested</bar>',
        '<bar>',
        '</bar>',
        '<bar>multiple</bar>',
        '<bar>',
        '</bar>',
        '<bar>children</bar>',
        '<bar>',
        '</bar>'
    ]);
});

test('.search() with multiple simple .text matches', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({ text: ['multiple', 'children'] });
    expect(filtered.map(n => n.parent!.text)).toEqual([
        '<bar>multiple</bar>',
        '<bar>children</bar>',
    ]);
});

test('.search() with simple .kind match', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({ kind: 'element.bar' });
    expect(filtered.map(n => n.text)).toEqual([
        '<bar>double nested</bar>',
        '<bar>multiple</bar>',
        '<bar>children</bar>'
    ]);
});

test('.search() with regex .kind match', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({ kind: /element\.[^.]*$/g });
    expect(filtered.map(n => n.kind)).toEqual([
        'element.foo',
        'element.bar',
        'element.foo',
        'element.bar',
        'element.bar',
    ]);
});

test('.search() with multiple simple .kind matches', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({ kind: ['tag.foo.open', 'tag.bar.close'] });
    expect(filtered.map(n => n.text)).toEqual([
        '<foo>',
        '</bar>',
        '<foo>',
        '</bar>',
        '</bar>'
    ]);
});