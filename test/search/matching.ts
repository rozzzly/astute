import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import Source from '../../src/Source';
import { markTags } from '../_simple-tags';

test('.search() with simple .text match', () => {
    const src = new Source(stripIndent`
        <foo><bar>double nested</bar></foo>
        <foo>
            <bar>multiple</bar>
            <bar>children</bar>
        </foo>
    `, 'test');
    markTags(src);
    const [filtered] = src.search({ text: 'multiple' });
    expect(filtered.parent?.text).toBe('<bar>multiple</bar>');
});

test('.search() with regex .text match', () => {
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
        '<bar>double nested</bar>', // twice because inside of <foo>...</foo> has its
        '<bar>double nested</bar>', // own node with <bar>...</bar> as its sole child
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
    const filtered = src.search({ kind: /element\.[^.]*$/ });
    expect(filtered.map(n => n.kind)).toEqual([
        'element.foo',
        'element.bar',
        'element.foo',
        'element.bar',
        'element.bar',
    ]);
});

