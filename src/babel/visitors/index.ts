import { TraverseOptions } from '@babel/traverse';
import BabelSource from '../BabelSource';
import createPrimitiveVisitors from './primitives';

export function createVisitors(this: BabelSource): TraverseOptions {
    return [
        createPrimitiveVisitors
    ].reduce((reduction, visitorCreator) => ({
        ...reduction,
        ...(visitorCreator.call(this))
    }), { });
}
export default createVisitors;
