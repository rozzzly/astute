import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import { castAsRanged } from '../../utils';
import BabelSource from '../BabelSource';

export default function identifierVisitors(this: BabelSource): TraverseOptions {
    return {
        Identifier: (path)  => {
            const { node, parent } = path;
            castAsRanged(node);
            if (t.isImportDefaultSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            } else if (t.isImportNamespaceSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            } else if (t.isImportSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            }
        }
    };
}