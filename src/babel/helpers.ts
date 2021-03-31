import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

import ScopeNode from '../ScopeNode';
import BabelSource, { BabelToken } from './BabelSource';
import { castAsRanged } from '../utils';

export type BabelTokenFilterPredicate = (token: BabelToken) => boolean;

export interface BabelTokenPair {
    openToken: BabelToken;
    closeToken: BabelToken;
}

export function findTokenPairs(src: BabelSource, node: ScopeNode, openPredicate: BabelTokenFilterPredicate, closePredicate: BabelTokenFilterPredicate): BabelTokenPair | false;
export function findTokenPairs<T extends t.Node>(src: BabelSource, path: NodePath<T>, openPredicate: BabelTokenFilterPredicate, closePredicate: BabelTokenFilterPredicate): BabelTokenPair | false;
export function findTokenPairs(src: BabelSource, start: number, end: number,  openPredicate: BabelTokenFilterPredicate, closePredicate: BabelTokenFilterPredicate): BabelTokenPair | false;
export function findTokenPairs(src: BabelSource, ...args: any[]): BabelTokenPair | false {
    let start: number, end: number, openPredicate: BabelTokenFilterPredicate, closePredicate: BabelTokenFilterPredicate;
    if (args.length === 3) {
        if (args[0] instanceof ScopeNode) {
            start = args[0].start;
            end = args[0].end;
        } else {
            start = args[0].node.start;
            end = args[0].node.end;
        }
        openPredicate = args[1];
        closePredicate = args[2];
    } else {
        start = args[0];
        end = args[1];
        openPredicate = args[2];
        closePredicate = args[3];
    }
    const tokens = src.findBabelTokens(start, end, bToken => (
        openPredicate(bToken) || closePredicate(bToken)
    ));
    const open = tokens.find(openPredicate);
    const close = tokens.reverse().find(closePredicate);
    if (open && close && open !== close) return { openToken: open, closeToken: close };
    else return false;
}

export function annotateBlockPunctuation<T extends t.Node>(src: BabelSource, path: NodePath<T>): void {
    const pairs = findTokenPairs(src, path, bToken => bToken.type.label === '{', bToken => bToken.type.label === '}');
    if (pairs) {
        const { openToken, closeToken } = pairs;
        src.slice(openToken).kind = 'punctuation.definition.block';
        src.slice(closeToken).kind = 'punctuation.definition.block';
    }
}

export function handlePossibleTerminator<T extends t.Node>(src: BabelSource, path: NodePath<T>): number;
export function handlePossibleTerminator(src: BabelSource, path: NodePath): number {
    // drop generic for signature of actual function because generic does not play nice with deepCastAsRanged
    const { node } = castAsRanged(path);
    const [ terminator ] = src.findBabelTokens(node.end - 1, node.end, bToken => (
        bToken.type.label === ';'
    ));
    if (terminator) {
        const terminatorNode = src.slice(terminator);
        terminatorNode.kind = 'punctuation.terminator.statement';
        return terminatorNode.start;
    } else {
        return node.end;
    }
}


/**
 * tmlanguage considers the `export` keyword to be a child of exported item's declaration body
 * For example, given:
 * ````ts
 * export interface Foo {
 *     // ...
 * }
 * ````
 * The scope for the `export` keyword resolves to `source > meta.interface > keyword.control.export` wherein `keyword.control.export`
 * is a child of `meta.interface`. This is conflicts with the AST from Babel which considers the interface declaration
 * to be a child of the export declaration, ie: `Program > ExportNamedDeclaration > TSInterfaceDeclaration`
 *
 * The simplest way to handle this is to have the exported item declarations (interfaces, classes, variables, etc) quickly check
 * to see if their parent is an export and if so to include it in their range
 */
export function handlePossibleNamedExport<T extends t.Node>(src: BabelSource, path: NodePath<T>): [number, () => void];
export function handlePossibleNamedExport(src: BabelSource, path: NodePath): [number, () => void] {
    // drop generic for signature of actual function because generic does not play nice with deepCastAsRanged

    const { node, parent } = castAsRanged(path);
    let start = node.start;
    let isExported = false;
    if (path.parent && t.isExportNamedDeclaration(parent)) {
        start = parent.start;
        isExported = true;
    }
    return [
        start,
        () => {
            if (isExported) {
                const [ exportKeyword ] = src.findBabelTokens(start, node.end, (token) => (
                    token.type.label === 'export' && token.value === 'export'
                ), 1);
                const exportKeywordToken = src.slice(exportKeyword);
                exportKeywordToken.kind = 'keyword.control.export';
            }
        }
    ];
}

export const looksLikeConst = (identifier: string): boolean => identifier === identifier.toUpperCase();
