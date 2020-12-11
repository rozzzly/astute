import { TraverseOptions } from '@babel/traverse';
import BabelSource from '../BabelSource';
import primitiveVisitors from './primitives';
import operatorVisitors from './operators';

export function createVisitors(this: BabelSource): TraverseOptions {
    return [
        primitiveVisitors,
        operatorVisitors
    ].reduce((reduction, visitor) => ({
        ...reduction,
        ...(visitor.call(this)),
    }), { });
}
export default createVisitors;
