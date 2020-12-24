import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';
import { castAsRanged } from '../../utils';
import BabelSource from '../BabelSource';
import { annotateBlockPunctuation, findTokenPairs } from '../helpers';
import { oneLine } from 'common-tags';

export default function objectVisitors(this: BabelSource): TraverseOptions {
    return {
        ObjectExpression: path => {
            const { node } = path;
            castAsRanged(node);
            const literal = this.sliceAndBranch(node);
            literal.kind = 'meta.objectliteral';
            annotateBlockPunctuation(this, path);
            const commas = this.findBabelTokensBetweenChildren(node.start, node.end, node.properties, bToken => bToken.type.label === ',');
            for (const comma of commas) {
                literal.slice(comma).kind = 'punctuation.separator.comma';
            }
        },
        ObjectProperty: path => {
            castAsRanged(path.node);
            const { node, parent, parentPath } = path;

            if (t.isObjectPattern(parent)) {
                this.warn('Unhandled ObjectProperty in an ObjectPattern', { node, path, parent });
            } else {
                const member = this.sliceAndBranch(node);
                member.kind = 'meta.object.member';

                if (node.shorthand) {
                    // IdentifierReference shorthand in object literals  (eg: `let foo = { x: 5, bar }`) don't have any addition
                    // scopes beyond what it gets from the Identifer visitor therefor when one is detected, we're done with that node
                    return;
                }
                castAsRanged(node.key);
                castAsRanged(node.value);
                const [ separator ] = this.findBabelTokens(node.key.end, node.value.start, bToken => (
                    bToken.type.label === ':'
                ), 1);
                if (!separator) {
                    throw new Error(oneLine`
                        An ObjectProperty should have a PropertyAssignmentToken ':' between the key and the value.
                    `);
                }

                if (node.computed) { // need to capture the brackets because prop's key is computed
                    const computedBracketTokens = findTokenPairs(
                        this,
                        node.start,
                        separator.start,
                        bToken => bToken.type.label === '[',
                        bToken => bToken.type.label === ']'
                    );
                    if (!computedBracketTokens){
                        throw new Error(oneLine`
                            Computed keys of an ObjectProperty should directly proceeded and followed by '[' and ']' tokens, respectively.
                        `);
                    }
                    const { openToken, closeToken } = computedBracketTokens;
                    // the : token
                    const propertyKey = member.sliceAndBranch(openToken.start, separator.end);
                    propertyKey.kind = 'meta.object-literal.key';
                    propertyKey.slice(separator).kind = 'punctuation.separator.key-value';
                    // the [ and ] tokens
                    const computedKey = propertyKey.sliceAndBranch(openToken.start, closeToken.end);
                    computedKey.kind = 'meta.array.literal';
                    computedKey.slice(openToken).kind = 'meta.brace.square';
                    computedKey.slice(closeToken).kind = 'meta.brace.square';
                } else {
                    const propertyKey = member.sliceAndBranch(node.key.start, separator.end);
                    propertyKey.kind = 'meta.object-literal.key';
                    propertyKey.slice(separator).kind = 'punctuation.separator.key-value';
                }
            }
        }
    };
}