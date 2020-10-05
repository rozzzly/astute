export interface Rect {
    width: number;
    height: number;
}


export function isValidRect(obj: any): obj is Rect {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'width' in obj &&
        'height' in obj &&
        typeof obj.width === 'number' &&
        typeof obj.height === 'number' &&
        obj.width > 0 &&
        obj.height > 0
    );
}
