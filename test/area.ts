import { test, expect } from '@jest/globals';
import { getAreaOfRect } from '../src/math/geometry/area';

test('calc area of rectangle', () => {
    expect(getAreaOfRect({ width: 12, height: 3 })).toBe(36);
});
