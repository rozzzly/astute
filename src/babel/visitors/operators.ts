import { TraverseOptions, NodePath } from '@babel/traverse';
import { oneLine } from 'common-tags';
import { castAsRanged } from '../../utils';
import BabelSource from '../BabelSource';

const binaryOperatorTokens = [
    '+' , '-' , '/' , '%' , '*' , '**' , '&' , ',' ,
    '>>' , '>>>' , '<<' , '^' , '==' , '===' , '!=' ,
    '!==' , 'in' , 'instanceof' , '>' , '<' , '>=' , '<='
];

export default function operatorVisitors(this: BabelSource): TraverseOptions {
    return {
        BinaryExpression: path => {
            const { node } = castAsRanged(path);

            let kind = '';
            switch (node.operator) {
                case '+':
                case '-':
                case '**':
                case '/':
                case '%':
                    kind = 'keyword.operator.arithmetic';
                    break;
                case '<<':
                case '>>':
                case '>>>':
                    kind = 'keyword.operator.bitwise.shift';
                    break;
                case 'in':
                    kind = 'keyword.operator.expression.in';
                    break;
                case 'instanceof':
                    kind = 'keyword.operator.expression.instanceof';
                    break;
                case '&':
                case '|':
                case '^':
                    kind = 'keyword.operator.bitwise';
                    break;
                case '!=':
                case '==':
                case '!==':
                case '===':
                    kind =  'keyword.operator.comparison';
                    break;
                case '>':
                case '<':
                case '>=':
                case '<=':
                    kind =  'keyword.operator.comparison';
                    break;
            }
            const [ token ] = this.findBabelTokens(node.left.end, node.right.start);
            if (!token || !binaryOperatorTokens.includes(token.value)) {
                throw new Error(oneLine`
                    Expected to find a binary operator token between .left and .right
                `);
            } else {
                this.slice(token).kind = kind;
            }
        },
        UnaryExpression: path => {
            const { node } = castAsRanged(path);
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
                    this.warn(`Unhandled UnaryExpression operator: '${node.operator}'`, { node });
                    break;
            }
            this.slice(node).kind = kind;
        },
        UpdateExpression: path => {
            const { node } = castAsRanged(path);
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
            // [ NOTE ] use of `!node.prefix` here for the `reverse` parameter is very important:
            // an example of why: `(foo.bar[++i])++` is a valid `UpdateExpression`. When this visitor reaches
            // the outer `UpdateExpression`, the `reverse` parameter makes it possible to grab just the outer token,
            // not just the one that occurs first.
            const [ token ] = this.findBabelTokens(node, bToken => bToken.value === node.operator, 1, !node.prefix);
            this.slice(token).kind = kind;
        }
    };
}