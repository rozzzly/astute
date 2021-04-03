import { test, expect } from '@jest/globals';
import { stripIndent } from 'common-tags';
import BabelSource from '../../../../src/babel/BabelSource';

test('simple array expression with two items', () => {
    const src = new BabelSource(stripIndent`
        let whatever = [3, 'hello'];
    `, 'ts');
    src.tokenize();
    expect(src.serialize()).toEqual([

    ]);

});