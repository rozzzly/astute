import { TraverseOptions } from '@babel/traverse';
import { castAsRanged } from '../../utils';
import BabelSource from '../BabelSource';

export default function createPrimitiveVisitors(this: BabelSource): TraverseOptions {
    return {
        UnaryExpression: ({ node }) => {
            castAsRanged(node);
            let kind = '';
            switch (node.operator) {
                case '-':
                case '+':
                    kind = 'keyword.operator.arithmetic';
                    break;
                case '~':
                    kind = 'keyword.operator.bitwise';
                    break;
                case '!':
                    break;
                case 'delete':
                    kind = 'keyword.operator.expression.delete';
                    break;
                case 'throw':
                    kind = 'keyword.control.trycatch';
                    break;
                case 'typeof':
                    kind = 'keyword.operator.expression.typeof';
                    break;
                case 'void':
                    kind = 'keyword.operator.expression.void';
                    break;
                default:
                    throw new Error(`Unhandled UnaryExpression operator: '${node.operator}'`);
            }
            this.slice(node).kind = kind;
        },
        UpdateExpression: ({ node }) => {
            castAsRanged(node);
            let kind = '';
            switch (node.operator) {
                case '++':
                    kind = 'keyword.operator.increment';
                    break;
                case '--':
                    kind = 'keyword.operator.decrement';
                    break;
                default:
                    throw new Error(`Unhandled UpdateExpression operator: '${node.operator}'`);
            }
            // TODO use of `!node.prefix` here for the `reverse` parameter is very important:
            // an example of why: `(foo.bar[++i])++` is a valid `UpdateExpression`. When this visitor reaches
            // the outer `UpdateExpression`, the `reverse` parameter makes it possible to grab just the outer token,
            // not just the one that occurs first
            const [token] = this.findBabelTokens(node, bToken => bToken.value === node.operator, 1, !node.prefix);
            this.slice(token).kind = kind;
        }
    };
}