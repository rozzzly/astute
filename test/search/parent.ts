import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import Source from '../../src/Source';
import { markTags } from '../_simple-tags';

test('.search() with simple .text match and a simple .kind match against a .parent condition', () => {
    const src = new Source(stripIndent`
        <bar>foobar</bar>
        <foo>foobar</foo>
    `, 'test');
    markTags(src);
    const filtered = src.search({
        text: 'foobar',
        parent: {
            kind: 'element.bar'
        }
    });
    expect(filtered.map(n => n.parent!.kind)).toEqual([
        'element.bar'
    ]);
});

test('.search() with nested .parent conditions', () => {
    const src = new Source(stripIndent`
        <two>
            <three>red</three>
        </two>
        <one>
            <four>
                <three>blue</three>
            </four>
            <two>
                <three>green</three>
            </two>
        </one>
    `, 'test');
    markTags(src);
    const filtered = src.search({
        kind: 'element.three',
        parent: {
            kind: 'element.two',
            parent: {
                kind: 'element.one'
            }
        }
    });
    expect(filtered.map(n => n.text)).toEqual([
        '<three>green</three>'
    ]);
});
