import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import BabelSource from '../BabelSource';
import { handlePossibleNamedExport, handlePossibleTerminator } from '../helpers';
import { castAsRanged } from '../../utils';

export default function expressionVisitors(this: BabelSource): TraverseOptions {
    return {
        VariableDeclarator: path => {
            const { node } = castAsRanged(path);

            let lhsEnd = node.end;
            if (node.init) {
                const [ equalsToken ] = this.findBabelTokens(node.id.end, node.init.start, b => (
                    b.value === '='
                ), 1);
                if (!equalsToken) {
                    throw new EvalError(`A VariableDeclarator with an Initializer should have an AssignmentOperatorToken (ie: '=') after the BindingIdentifer/BindingPattern and before the Initializer.`);
                }
                lhsEnd = equalsToken.start;
                this.slice(equalsToken).kind = 'keyword.operator.assignment';
            } else {
                // ?
            }
            if (t.isIdentifier(node.id)) {
                this.sliceAndBranch(node.start, lhsEnd).kind = 'meta.var-single-variable.expr';
                this.sliceAndBranch(node.id.start, (node.id.typeAnnotation
                    ? node.id.typeAnnotation.start
                    : node.id.end
                )).kind = 'meta.definition.variable';
            } else if (t.isArrayPattern(node.id)) {
                // scope 'meta.array-binding-pattern-variable' will be applied by ArrayPattern visitor
                return;
            } else if (t.isObjectPattern(node.id)) {
                // scope 'meta.object-binding-pattern-variable' will be applied by ObjectPattern visitor
                return;
            } else {
                this.warn('unhandled VariableDeclarator', { path, node });
            }
        },
        VariableDeclaration: path => {
            const [ start, handleExportToken ] = handlePossibleNamedExport(this, path);
            const end = handlePossibleTerminator(this, path);
            const declaration = this.sliceAndBranch(start, end);
            declaration.kind = 'meta.var.expr';

            const [ keyword ] = this.findBabelTokens(start, end, b => (
                b.value === 'const' ||
                b.value === 'let' ||
                b.value === 'var'
            ), 1);
            if (!keyword) {
                throw new EvalError(`VariableDeclaration should have a keyword (ie: 'const', 'let', 'var')`);
            }
            this.slice(keyword).kind = 'storage.type';
            handleExportToken();
        },
    };
}