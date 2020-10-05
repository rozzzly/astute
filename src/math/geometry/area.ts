import multiply from '../multiply';
import { Rect } from './index';

export function getAreaOfRect(rect: Rect): number {
    return multiply(rect.width, rect.height);
}
