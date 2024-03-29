import { TraverseOptions } from '@babel/traverse';
import BabelSource from '../BabelSource';
import primitiveVisitors from './primitives';
import operatorVisitors from './operators';
import miscVisitors from './misc';
import identifierVisitors from './identifiers';
import objectVisitors from './objects';

export function createVisitors(this: BabelSource): TraverseOptions {
    return [
        primitiveVisitors,
        operatorVisitors,
        identifierVisitors,
        objectVisitors,
        miscVisitors
    ].reduce((reduction, visitor) => ({
        ...reduction,
        ...(visitor.call(this)),
    }), { });
}
export default createVisitors;
