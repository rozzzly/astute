import * as t from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import Source from '../Source';
import traverse from '@babel/traverse';
import createVisitors from './visitors';
import { Ranged } from '../ScopeNode';
import { dumbAssert } from '../utils';

/**
 * Babel's type definitions have tokens typed as `Array<any> | null` which is useless.
 * Here's an actual type definition for it.
 */
export interface BabelToken extends Ranged {
    type: {
        label: string;
        keyword: any;
        beforeExpr: boolean;
        startsExpr: boolean;
        rightAssociative: boolean;
        isLoop: boolean;
        isAssign: boolean;
        prefix: boolean;
        postfix: boolean;
        binop: boolean | null;
    };
    value: string;
    start: number;
    end: number;
}

export type BabelTokenFilterPredicate = (token: BabelToken) => boolean;

export type BabelSourceLang = (
    | 'ts'
    | 'tsx'
    | 'js'
    | 'jsx'
);

const defaultBabelOpts: ParserOptions = {
    sourceType: 'module',
    plugins: [
        'jsx',
        'typescript',
        ['decorators', { decoratorsBeforeExport: true }],
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'dynamicImport',
        'nullishCoalescingOperator',
        'objectRestSpread',
        'optionalChaining'
    ],
    tokens: true,
    createParenthesizedExpressions: true
};

export class BabelSource extends Source<BabelSourceLang> {
    babelTokens: BabelToken[];
    ast: Omit<t.File, 'tokens'> & { tokens: Array<BabelToken> }; // use of `Omit<...>` allows for hijacking of `.tokens`

    /**
     * If babelOpts is passed, a full config should be given because it will not try to merge what is passed with the default options.
     * However, if a custom babelOpts is given, somethings will be overridden:
     *   * `opts.tokens` will be `true`
     *   * `opts.createParenthesizedExpressions` will be `true`
     *   * `opts.sourceType` will be `'module'` (this might not be overridden in the future)
     * @param text {string} text of the source
     * @param sourceLang {BabelSourceLang} used to se the default
     * @param babelOpts {import('@babel/parser').ParserOptions} options to pass to `@babel/parser` if passed, does not attempt to merge with defaults
     */
    constructor(text: string, sourceLang: BabelSourceLang, babelOpts?: ParserOptions) {
        super(text, sourceLang);
        const parserOpts = {
            ...(babelOpts || defaultBabelOpts),
            sourceType: 'module',
            tokens: true,
            createParenthesizedExpressions: true
        } as ParserOptions;
        this.ast = parse(this.text, parserOpts) as any; // the `as any` cast smother assignability error caused by hijacking of `.tokens`
        this.babelTokens = this.ast.tokens;
    }

    tokenize() {
        traverse(this.ast, createVisitors.call(this));
    }

    findBabelTokens<R extends Ranged>(range: R): BabelToken[];
    findBabelTokens<R extends Ranged>(range: R, reverse: boolean): BabelToken[];
    findBabelTokens<R extends Ranged>(range: R, predicate: BabelTokenFilterPredicate): BabelToken[];
    findBabelTokens<R extends Ranged>(range: R, predicate: BabelTokenFilterPredicate, reverse: boolean): BabelToken[];
    findBabelTokens<R extends Ranged>(range: R, predicate: BabelTokenFilterPredicate, limit: number): BabelToken[];
    findBabelTokens<R extends Ranged>(range: R, predicate: BabelTokenFilterPredicate, limit: number, reverse: boolean): BabelToken[];
    findBabelTokens(start: number, end: number): BabelToken[];
    findBabelTokens(start: number, end: number, reverse: boolean): BabelToken[];
    findBabelTokens(start: number, end: number, predicate: BabelTokenFilterPredicate): BabelToken[];
    findBabelTokens(start: number, end: number, predicate: BabelTokenFilterPredicate, reverse: boolean): BabelToken[];
    findBabelTokens(start: number, end: number, predicate: BabelTokenFilterPredicate, limit: number): BabelToken[];
    findBabelTokens(start: number, end: number, predicate: BabelTokenFilterPredicate, limit: number, reverse: boolean): BabelToken[];
    findBabelTokens(...args: any[]): BabelToken[] {
        let start = -1, end = -1;
        let predicate: BabelTokenFilterPredicate | null = null;
        let limit: number = Number.MAX_SAFE_INTEGER;
        let reverse: boolean = false;

        let params: (
            | []
            | [reverse: boolean]
            | [predicate: BabelTokenFilterPredicate]
            | [predicate: BabelTokenFilterPredicate, limit: number]
            | [predicate: BabelTokenFilterPredicate, reverse: boolean]
            | [predicate: BabelTokenFilterPredicate, limit: number, reverse: boolean]
        ) = [];

        if (typeof args[0] === 'number') {
            start = args[0];
            end = args[1];
            params = args.slice(2) as any;
        } else {
            dumbAssert<Ranged>(args[0]);
            start = args[0].start;
            end = args[0].end;
            params = args.slice(1) as any;
        }

        if (params.length === 1) {
            if (typeof params[0] === 'boolean') {
                reverse = params[0];
            } else {
                predicate= params[0];
            }
        } else if (params.length === 2) {
            predicate = params[0];
            if (typeof params[1] === 'boolean') {
                reverse = params[1];
            } else {
                limit = params[1];
            }
        } else if (params.length === 3) {
            predicate = params[0];
            limit = params[1];
            reverse = params[2];
        }

        if (!this.babelTokens.length) {
            throw new Error('No babel tokens found!?');
        }
        if (this.babelTokens[0].start > start || this.babelTokens[this.babelTokens.length-1].end < end) {
            throw new RangeError(`Asking for tokens in range [${start}, ${end}] which is outside of the token set`);
        }

        const result = [];
        let infRecDetectionCount = 0;
        let low = 0, mid, pMid;
        let high = this.ast.tokens.length - 1;
        let cToken: BabelToken | null = null, pToken: BabelToken | null = null;
        // eslint-disable-next-line no-constant-condition
        while (true) { /// TODO sloppy -- fix this
            if (infRecDetectionCount++ > 1000) {
                console.log(`infinite recursion detected: ${start}:${end}`);
                return [];
            }
            pMid = mid;
            pToken = cToken;
            mid = Math.floor((high + low) / 2);
            cToken = this.ast.tokens[mid];

            if (low >= high) {
                mid = low;
                /// TODO - what was purpose of next line? ids is it just cruft or broken logic gone unnoticed?
                // cToken[high];
                break; // in an infinite loop over the same element
            } else if (cToken.start > start) { // cToken start too late, move cursor left
                high = mid - 1;
            } else if (cToken.end <= start) { // cToken ends too early, more cursor right
                low = mid + 1;
            } else if (cToken.start <= start && cToken.end > start) { // start is within this token; clean break
                break;
            } else {
                /// TODO revisit these next few lines; why am I testing pMid/mid for if either result has same outcome
                console.log(mid, cToken, pMid, pToken);
                if (pMid === mid) { // stuck on the same token, just choose it.
                    break;
                } else {
                    break;
                }
            }
        }

        let count = 0;
        do {
            if (!predicate || predicate(this.ast.tokens[mid])) {
                result.push(this.ast.tokens[mid]);
                count++;
            }
            cToken = this.ast.tokens[++mid];
        } while(cToken && cToken.end <= end && (reverse || count < limit));

        return (reverse
            ? result.reverse().slice(0, limit)
            : result
        );
    }
}

export default BabelSource;