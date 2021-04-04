import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import BabelSource from '../BabelSource';
import { castAsRanged } from '../../utils';
import { oneLine } from 'common-tags';
import { consumeLeadingWhitespace, findTokenPairs } from '../helpers';
import Source from '../../Source';



export default function arrayVisitors(this: BabelSource): TraverseOptions {
    return {
        ArrayExpression: path => {
            const { node, parent } = castAsRanged(path);

            const start = consumeLeadingWhitespace(this, path);
            const literal = this.sliceAndBranch(start, node.end);
            literal.kind = 'meta.array.literal';

            const pairs = findTokenPairs(this, path, bToken => bToken.type.label === '[', bToken => bToken.type.label === ']');
            if (pairs) {
                const { openToken, closeToken } = pairs;
                this.slice(openToken).kind = 'meta.brace.square';
                this.slice(closeToken).kind = 'meta.brace.square';
            } else {
                throw new Error(`Expected to find matching '[' and ']' tokens for this ArrayExpression`);
            }

            const commas = this.findBabelTokensBetweenChildren(node.start, node.end, node.elements, bToken => bToken.type.label === ',');
            for (const comma of commas) {
                literal.slice(comma).kind = 'punctuation.separator.comma';
            }
        }
    };
}