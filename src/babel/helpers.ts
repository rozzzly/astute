import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

import BabelSource from './BabelSource';
import { castAsRanged } from '../utils';

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
