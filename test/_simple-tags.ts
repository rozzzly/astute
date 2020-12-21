import Source from '../src/Source';

export function markTags(src: Source, startOffset: number = src.start, endOffset: number = src.end): void {
    const tagRegExp = /(<(\S+)>)([\s\S]*?)(<\/\2>)/g;
    const matchableText = src.text.slice(startOffset, endOffset);
    let match;
    while (match = tagRegExp.exec(matchableText)) {
        const elementName = match[2];
        const start = startOffset + match.index;
        const end = start + match[0].length;
        const openStart = start;
        const openEnd = start + match[1].length;
        const closeEnd = end;
        const closeStart = end - match[4].length;
        const contentStart = openEnd;
        const contentEnd = closeStart;

        src.sliceAndBranch(start, end).kind = `element.${elementName}`;
        src.slice(openStart, openEnd).kind = `tag.${elementName}.open`;
        src.sliceAndBranch(contentStart, contentEnd).kind = `element.${elementName}.body`;
        src.slice(closeStart, closeEnd).kind = `tag.${elementName}.close`;
        markTags(src, contentStart, contentEnd);
    }
}