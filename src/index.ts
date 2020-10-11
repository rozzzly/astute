
import { double } from './math/multiply';
import { isValidRect } from './math/geometry';
import { getAreaOfRect } from './math/geometry/area';

export default function astute(): void {
    console.log(double(2));
    console.log(getAreaOfRect({ width: 8, height: 4 }));
}
