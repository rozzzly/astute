import { ScopeNode } from './ScopeNode';

const linebreakRegExp = /\r?\n/g;

export class Source<SourceLang extends string = string> extends ScopeNode {

    sourceLang : SourceLang;

    constructor(text: string, sourceLang: SourceLang) {
        super(`source.${sourceLang}`, text, 0, text.length, null);
        this.sourceLang = sourceLang;
        this.children = [
            new ScopeNode('', this.text, 0, this.text.length, this)
        ];
    }

    breakLines(): ScopeNode[][] {
        const lines: ({ start: number, end: number})[] = [];
        let match: RegExpExecArray | null;
        while (match = linebreakRegExp.exec(this.text)) {
            lines.push({ start: match.index, end: match.index + match[0].length });
        }
        for (const { start, end } of lines) {
            const line = this.split(start, end).inner;
            line.kind = 'newline';
        }
        const result: ScopeNode[][] = [];
        let currentLine: ScopeNode[] = [];
        for (const node of this.children) {
            if (node.kind == 'newline') {
                result.push(currentLine);
                currentLine = [];
            } else {
                currentLine.push(node);
            }
        }
        if (currentLine.length) {
            result.push(currentLine);
        }
        return result;
    }
}

export default Source;
