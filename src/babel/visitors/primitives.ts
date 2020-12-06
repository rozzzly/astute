import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import BabelSource from '../BabelSource';
import ScopeNode, { Ranged } from '../../ScopeNode';
import { castAsRanged, dumbAssert } from '../../utils';

declare module '@babel/types' {
    export interface NumericLiteral {
        extra: {
            raw: string;
            rawValue: number;
        };
    }
}


export default function createPrimitiveVisitors(this: BabelSource): TraverseOptions {
    return {
        StringLiteral: ({ node }) => {
            castAsRanged(node);
            const literal = this.sliceAndBranch(node);

            if (literal.length < 2 || literal.text[0] !== literal.text[literal.text.length - 1]) {
                throw new RangeError('String should be at least two character long (the opening and closing quote marks)');
            }
            // determine quote type
            let quoteType = '';
            if (literal.text[0] === '\'') quoteType = 'single';
            else if (literal.text[0] === '"') quoteType = 'double';
            else {
                throw new EvalError(`Unexpected quotation mark kind. Expected single (') or double (") quotes.`);
            }
            // set scopes and kind type for entire range ()
            literal.kind = `string.quoted.${quoteType}`;

            const { head, tail } = literal.slice(node.start + 1, node.end - 1, true);
            dumbAssert<ScopeNode>(head); // guaranteed safe because the +1, -1 offsets on the line above
            dumbAssert<ScopeNode>(tail); // ensure that its a center slice so there will be a head and tail
            head.kind = 'punctuation.definition.string.start';
            tail.kind = 'punctuation.definition.string.end';
        },
        TSStringKeyword: ({ node }) => {
            castAsRanged(node);
            this.slice(node).kind = 'support.type.primitive';
        },
        TSNumberKeyword: ({ node }) => {
            castAsRanged<Ranged>(node);
            this.slice(node).kind = 'support.type.primitive';
        },
        TSSymbolKeyword: ({ node }) => {
            castAsRanged(node);
            this.slice(node).kind = 'support.type.primitive';
        },
        TSBooleanKeyword: ({ node }) => {
            castAsRanged(node);
            this.slice(node).kind = 'support.type.primitive';
        },
        BigIntLiteral: ({ node }) => {
            castAsRanged(node);
            const literal = this.sliceAndBranch(node);
            literal.kind = 'constant.numeric.decimal';
            literal.slice(node.end - 1, node.end).kind = 'storage.type.numeric.bigint';
        },
        NumericLiteral: ({ node }) => {
            castAsRanged(node);
            // this.findAndSlice(node).kind = 'constant.numeric.decimal';
            let kind = 'constant.numeric.decimal';
            const lower = node.extra.raw[1] ? node.extra.raw[1].toLowerCase() : '';
            if (lower === 'b') {
                kind = 'constant.numeric.binary';
            } else if (lower === 'x') {
                kind = 'constant.numeric.hex';
            } else if (lower === 'o') {
                kind = 'constant.numeric.octal';
            }
            const target = this.slice(node);
            target.kind = kind;
            const decimalOffset = node.extra.raw.indexOf('.');
            if (decimalOffset !== -1) {
                const inner = target.branch();
                const decimal = inner.slice(node.start + decimalOffset, node.start + decimalOffset + 1);
                decimal.kind = 'meta.delimiter.decimal.period';
            }
        },
        BooleanLiteral: path => {
            const { node } = path;
            castAsRanged(node);
            const boolToken = this.slice(node);
            if (path.parent && t.isTSLiteralType(path.parent)) {
                boolToken.kind = 'support.type.builtin';
            } else {
                if (node.value === true) {
                    boolToken.kind = 'constant.language.boolean.true';
                } else {
                    boolToken.kind = 'constant.language.boolean.false';
                }
            }
        },
    };
}
