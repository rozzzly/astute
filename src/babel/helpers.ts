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

export function handlePossibleTerminator<T extends t.Node>(src: BabelSource, path: NodePath<T>): number {
    castAsRanged(path.node);
    const [ terminator ] = src.findBabelTokens(path.node.end - 1, path.node.end, bToken => (
        bToken.type.label === ';'
    ));
    if (terminator) {
        const terminatorNode = src.slice(terminator);
        terminatorNode.kind = 'punctuation.terminator.statement';
        return terminatorNode.start;
    } else {
        return path.node.end;
    }
}

export const looksLikeConst = (identifier: string): boolean => identifier === identifier.toUpperCase();
