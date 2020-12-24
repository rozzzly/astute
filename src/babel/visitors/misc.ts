import { TraverseOptions } from '@babel/traverse';
import { castAsRanged } from '../../utils';
import BabelSource, { BabelToken } from '../BabelSource';
import { handlePossibleTerminator } from '../helpers';

export default function miscVisitors(this: BabelSource): TraverseOptions {
    return {
        ImportDeclaration: path => {
            castAsRanged(path.node);
            const { node } = path;
            const end = handlePossibleTerminator(this, path);
            const importDecl = this.sliceAndBranch(node.start, end);
            importDecl.kind = 'meta.import';

            const babelTokens: BabelToken[] = this.findBabelTokens(node.start, node.end);
            const openingPunct = babelTokens.find(token => token.type.label === '{');
            const closingPunct = babelTokens.find(token => token.type.label === '}');
            if (openingPunct || closingPunct) {
                if (!openingPunct || !closingPunct) {
                    throw new Error(`If present, NamedImports should have have both opening '{' and closing '}' punctuation.`);
                }
                const metaBlock = importDecl.sliceAndBranch(openingPunct.start, closingPunct.end);
                metaBlock.kind = 'meta.block';
            }

            for (const babelToken of babelTokens) {
                if (babelToken.type.label === 'import') {
                    this.slice(babelToken).kind = 'keyword.control.import';
                } else if (babelToken.type.label === '{') {
                    this.slice(babelToken).kind = 'punctuation.definition.block';
                } else if (babelToken.type.label === '}') {
                    this.slice(babelToken).kind = 'punctuation.definition.block';
                } else if (babelToken.type.label === '*') {
                    this.slice(babelToken).kind = 'constant.language.import-export-all';
                }  else if (babelToken.type.label === ',') {
                    this.slice(babelToken).kind = 'punctuation.separator.comma';
                } else if (babelToken.type.label === 'name') {
                    if (babelToken.value === 'from') {
                        this.slice(babelToken).kind = 'punctuation.definition.block';
                    } else if (babelToken.value === 'as') {
                        this.slice(babelToken).kind = 'keyword.control.as';
                    } else if (babelToken.value ==='default') {
                        this.slice(babelToken).kind = 'keyword.control.default';
                    } // otherwise this is an Identifier and will be handled by that Visitor
                }
            }
        },
        RestElement: path => {
            castAsRanged(path.node);
            const { node } = path;
            const [ restToken ] = this.findBabelTokens(node.start, node.end, bToken => (
                bToken.type.label === '...'
            ), 1);
            this.slice(restToken).kind = 'keyword.operator.rest';
        }
    };
}