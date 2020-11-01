import { ScopeNode } from './ScopeNode';

export class Source<SourceLang extends string = string> extends ScopeNode {

    sourceLang : SourceLang;

    constructor(text: string, sourceLang: SourceLang) {
        super(`source.${sourceLang}`, text, 0, text.length, null);
        this.sourceLang = sourceLang;
        this.children = [
            new ScopeNode('', this.text, 0, this.text.length, this)
        ];
    }
}

export default Source;
