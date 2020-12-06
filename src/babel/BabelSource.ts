import * as t from '@babel/types';
import { parse, ParserOptions } from '@babel/parser';
import Source from '../Source';
import traverse from '@babel/traverse';
import createVisitors from './visitors';
import { Ranged } from '../ScopeNode';

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
}

export default BabelSource;