import * as t from '@babel/types';
import { TraverseOptions } from '@babel/traverse';

import { castAsRanged } from '../../utils';
import BabelSource from '../BabelSource';
import { looksLikeConst } from '../helpers';

export default function identifierVisitors(this: BabelSource): TraverseOptions {
    return {
        Identifier: (path)  => {
            const { node, parent } = castAsRanged(path);
            if (t.isImportDefaultSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            } else if (t.isImportNamespaceSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            } else if (t.isImportSpecifier(parent)) {
                this.slice(node).kind = 'variable.other.readwrite.alias';
            } else if (t.isObjectProperty(parent)) {
                if (parent.shorthand) {
                    this.slice(node).kind = 'variable.other.readwrite';
                } else if (parent.computed) {
                    if (looksLikeConst(node.name)) {
                        this.slice(node).kind = 'variable.other.constant';
                    } else {
                        this.slice(node).kind = 'variable.other.readwrite';
                    }
                } else {
                    return; // noop; it's a normal property, doesn't get special tag on Identifier
                }
            } else {
                if (looksLikeConst(node.name)) {
                    this.slice(node).kind = 'variable.other.constant';
                } else {
                    this.slice(node).kind = 'variable.other.readwrite';
                }
            }
        }
    };
}