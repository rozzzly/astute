import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import BabelSource from '../BabelSource';
import { castAsRanged } from '../../utils';
import { oneLine } from 'common-tags';
import { findTokenPairs } from '../helpers';

const foo = [3, 5];
console.log('foo', [ ]);
let i = 0;
for ( [0]; i < 5; i++) {
    i--;
}

export default function arrayVisitors(this: BabelSource): TraverseOptions {
    return {
        ArrayExpression: path => {
            const { node, parent } = castAsRanged(path);
            let start = node.start;
            if (path.key === 'init' && 'init' in parent) {
                // t.ForStatement | t.EnumBooleanMember | t.EnumNumberMember | t.EnumStringMember | t.VariableDeclarator
                // enum stuff is flow syntax AFAICT and can be safely ignored (typescript enum stuff is named TSEnumMember, etc)
                if (t.isVariableDeclarator(parent)) {
                    const [ bToken ] = this.findBabelTokens(parent.id.end, node.start, bToken => bToken.value === '=', 1);
                    if (bToken) {
                        start = bToken.end;
                    } else {
                        this.warn(
                            `Was expecting to find a '=' token in the VariableDeclarator containing this ArrayExpression`,
                            { node, path, parent }
                        );
                    }
                } else if (t.isForStatement(parent)) {
                    // an ArrayExpression in the .init of a ForStatement would look like:
                    // `for([7]; true; i++) { ... }` which is nonsensical and I'll cover this edge case...
                    const [ bToken ] = this.findBabelTokens(parent, bToken => bToken.type.label === '(', 1);
                    if (bToken) {
                        start = bToken.end;
                    } else {
                        this.warn(oneLine`
                            Was expecting to find a '(' token preceding the initialExpression of the
                            ForExpression containing this ArrayExpression
                        `, { node, path, parent });
                    }
                }
            }
            /// TODO ::: handle other locations an Array Expression could occur
            /// (such as an AssignmentExpression or the arguments of a CallExpression)


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