export interface SlicedScopeNodeGroup {
    head?: ScopeNode;
    target?: ScopeNode;
    inner?: ScopeNode;
    tail?: ScopeNode;
}

export interface SplitScopeNodeGroup {
    head: ScopeNode[];
    inner: ScopeNode;
    tail: ScopeNode[];
}

export interface ScopeNodeWalker {
    skipChildren(): void;
    skipSiblings(): void;
    abort(): void;
}

export interface ScopeNodeVisitor {
    (this: ScopeNodeWalker, node: ScopeNode, walker: ScopeNodeWalker): void;
}

export interface Range {
    start: number;
    end: number;
}

export type SerializedScopeNode = [kind: string, children: string | Array<SerializedScopeNode>];

export class ScopeNode implements Range {
    start: number;
    end: number;
    kind: string;
    text: string;
    children: ScopeNode[];
    parent: ScopeNode | null;
    #prev: ScopeNode | null;
    #next: ScopeNode | null;

    constructor(kind: string, text: string, start: number, end: number, parent: ScopeNode | null) {
        this.start = start;
        this.end = end;
        this.text = text;
        this.kind = kind;
        this.parent = parent;
        this.children = [];
        this.#prev = null;
        this.#next = null;
    }

    get isTerminal(): boolean {
        return this.children.length === 0;
    }

    get depth(): number {
        let currentNode: ScopeNode = this, depth = 0;
        while(currentNode.parent) {
            depth++;
            currentNode = currentNode.parent;
        }
        return depth;
    }

    get index(): number {
        if (!this.parent) {
            const e = new Error('this should never be called on the root node!');
            console.error(e);
            throw e;
        } else {
            return this.parent.children.indexOf(this);
        }
    }

    get rightMostDescendant(): ScopeNode {
        if (this.isTerminal) return this;
        else return this.children[this.children.length - 1].rightMostDescendant;
    }

    get leftMostDescendant(): ScopeNode {
        if (this.isTerminal) return this;
        else return this.children[0].leftMostDescendant;
    }

    get prevSibling(): ScopeNode | null {
        return this.#prev;
    }

    get nextSibling(): ScopeNode | null {
        return this.#next;
    }

    get length(): number {
        return this.end - this.start;
    }

    clone(): ScopeNode;
    clone(start: number): ScopeNode;
    clone(start: number, end: number): ScopeNode;
    clone(_start: number | null = null, _end: number | null = null): ScopeNode {
        const start = _start ?? this.start;
        const end = _end ?? this.end;
        const relStart =  start - this.start;
        const relEnd = ((end !== -1)
            ? end - this.start
            : end
        );
        return new ScopeNode(this.kind, this.text.slice(relStart, relEnd), start, end, this.parent);
    }

    spawn(): ScopeNode;
    spawn(start: number): ScopeNode;
    spawn(start: number, end: number): ScopeNode;
    spawn(_start: number | null = null, _end: number | null = null): ScopeNode {
        const start = _start ?? this.start;
        const end = _end ?? this.end;
        const relStart =  start - this.start;
        const relEnd = ((end !== -1)
            ? end - this.start
            : end
        );
        return new ScopeNode('', this.text.slice(relStart, relEnd), start, end, this);
    }

    locate<R extends Range>(range: R): ScopeNode
    locate<R extends Range>(range: R, deepSearch: boolean): ScopeNode;
    locate(start: number, end: number): ScopeNode;
    locate(start: number, end: number, deepSearch: boolean): ScopeNode;
    locate(...args: any[]): ScopeNode {
        const [ start, end, deepSearch = true ] = interpretShorthandArgs(...args);
        // check to ensure range is valid
        if (start > end) {
            throw new Error(`The given range [${start}, ${end}] is invalid. `);
        }
        if (start < this.start || end > this.end) {
            throw new Error(`The given range [${start}, ${end}] is not within this ScopeNode's rage [${this.start}, ${this.end}]`);
        }
        // if result can't be narrowed down any more, return now
        if (this.isTerminal) {
            return this;
        }

        let low = 0;
        let high = this.children.length - 1;
        let mid = -1;
        let oldMid = -1;
        let cNode: ScopeNode;
        do {
            oldMid = mid;
            mid = Math.floor((high + low) / 2);
            if (mid === oldMid) {
                const e = new Error(`Encountered infinite recursion on range [${start}, ${end}]`);
                console.error(e, this);
                throw e;
            }
            cNode = this.children[mid];

            if (cNode.start > start) { // cNode start too late, move cursor left
                high = mid - 1;
            } else if (cNode.end <= start) { // cNode ends too early, more cursor right
                low = mid + 1;
            }
        } while(cNode.start > start || cNode.end <= start);

        return deepSearch ? cNode.locate(start, end) : cNode;
    }

    slice<R extends Range>(range: R): ScopeNode;
    slice<R extends Range>(range: R, includeAdjacent: false): SlicedScopeNodeGroup;
    slice<R extends Range>(range: R, includeAdjacent: true): SlicedScopeNodeGroup;
    slice<R extends Range>(range: R, includeAdjacent?: boolean): ScopeNode | SlicedScopeNodeGroup;
    slice(start: number, end: number): ScopeNode;
    slice(start: number, end: number, includeAdjacent: false): ScopeNode;
    slice(start: number, end: number, includeAdjacent: true): SlicedScopeNodeGroup;
    slice(start: number, end: number, includeAdjacent?: boolean): ScopeNode | SlicedScopeNodeGroup;
    slice(...args: any[]): ScopeNode | SlicedScopeNodeGroup {
        // untangle params from the many overloads
        const [ start, end, includeAdjacent = false ] = interpretShorthandArgs(...args);

        // throws if range is invalid; no need to include redundant checks here
        const node = this.locate(start, end, includeAdjacent);

        if (node !== this) { // this is not the deepest node containing that range:
            const node = this.locate(start, end); // find the deepest node for that range
            return node.slice(start, end, includeAdjacent); // have that node slice itself
        } else {
            // safety check for zero-width slices
            if (start === end) {
                if (!includeAdjacent) {
                    throw new Error(`Zero-width slices are prohibited unless 'includeAdjacent' is passed (as true) to prevent unexpected behavior`);
                }
                if (start === this.start || end === this.end) {
                    throw new Error('Zero-width slices at the head or tail of a ScopeNode are prohibited (to prevent zero-width ScopeNodes)');
                }
            }

            const relStart = start - this.start;
            const relEnd = end - this.start;
            if (this.start === start && this.end === end) { // [XXXXXXXX]
                // no slice needs to happen
                return (includeAdjacent
                    ? { target: this }
                    : this
                );
            } else if (start === end) { // [AAAABBBB]
                const head = this.clone(this.start, start);
                const tail = this.clone(end, this.end);
                // update .prev/.next refs
                head.#next = tail;
                tail.#prev = head;
                if (this.#prev) {
                    head.#prev = this.#prev;
                    head.#prev.#next = head;
                }
                if (this.#next) {
                    tail.#next = this.#next;
                    tail.#next.#prev = tail;
                }
                // inserts head and tail node where this one used to be
                this.parent!.children.splice(this.index, 1, head, tail);
                return { head, tail };
            } else if (this.start === start) { // [XXXX----]
                const tail = this.clone(end, this.end);
                // update the ranges
                this.end = end;
                // update the text
                this.text = this.text.slice(0, relEnd);
                // update .prev/.next refs
                tail.#prev = this;
                if (this.#next) {
                    tail.#next = this.#next;
                    tail.#next.#prev = tail;
                }
                this.#next = tail;
                // insert new node behind this node
                this.parent!.children.splice(this.index + 1, 0, tail);
                return (includeAdjacent
                    ?{ target: this, tail }
                    : this
                );
            } else if (this.end === end) { // [----XXXX]
                const head = this.clone(this.start, start);
                // update the ranges
                this.start = start;
                // update the text;
                this.text = this.text.slice(relStart);
                // update .prev/.next refs
                head.#next = this;
                if (this.#prev) {
                    head.#prev = this.#prev;
                    head.#prev.#next = head;
                }
                this.#prev = head;
                // insert new node in front of this node
                this.parent!.children.splice(this.index, 0, head);
                return (includeAdjacent
                    ? { head, target: this }
                    : this
                );
            } else { // [--XXXX--]
                const head = this.clone(this.start, start);
                const tail = this.clone(end, this.end);
                // update the ranges
                this.start = start;
                this.end = end;
                // update the text
                this.text = this.text.slice(relStart, relEnd);
                // update .prev/.next refs
                head.#next = this;
                tail.#prev = this;
                if (this.#prev) {
                    head.#prev = this.#prev;
                    head.#prev.#next = head;
                }
                if (this.#next) {
                    tail.#next = this.#next;
                    tail.#next.#prev = tail;
                }
                this.#prev = head;
                this.#next = tail;
                // insert new nodes in front of and behind this node
                this.parent!.children.splice(this.index, 1, head, this, tail);
                return (includeAdjacent
                    ? { head, target: this, tail }
                    : this
                );
            }
        }
    }

    branch(): ScopeNode {
        if (!this.isTerminal) {
            throw new Error('This ScopeNode is non-terminal and therefore is already branched. ');
        }
        const spawned = this.spawn(this.start, this.end);
        this.children = [ spawned ];
        return spawned;
    }

    sliceAndBranch<R extends Range>(range: R): ScopeNode;
    sliceAndBranch<R extends Range>(range: R, includeAdjacent: false): SlicedScopeNodeGroup;
    sliceAndBranch<R extends Range>(range: R, includeAdjacent: true): SlicedScopeNodeGroup;
    sliceAndBranch<R extends Range>(range: R, includeAdjacent?: boolean): ScopeNode | SlicedScopeNodeGroup;
    sliceAndBranch(start: number, end: number): ScopeNode;
    sliceAndBranch(start: number, end: number, includeAdjacent: false): ScopeNode;
    sliceAndBranch(start: number, end: number, includeAdjacent: true): SlicedScopeNodeGroup;
    sliceAndBranch(start: number, end: number, includeAdjacent?: boolean): ScopeNode | SlicedScopeNodeGroup;
    sliceAndBranch(...args: any[]): ScopeNode | SlicedScopeNodeGroup {
        const [ start, end, includeAdjacent = false ] = interpretShorthandArgs(...args);

        const sliced = this.slice(start, end, true);
        if (!sliced.target) {
            throw new Error('Zero-width slices cannot be branched');
        }

        if (includeAdjacent) {
            return {
                ...sliced,
                inner: sliced.target.branch()
            };
        } else {
            sliced.target.branch();
            return sliced.target;
        }
    }

    split(start: number, end: number): SplitScopeNodeGroup {
        const result: SplitScopeNodeGroup = {
            head: [],
            tail: [],
            inner: null
        } as any;
        /// [ get left/right siblings that have not been modified ] /////////////////////
        let left = this.prevSibling, right = this.nextSibling;
        if (left) {
            do {
                result.head.unshift(left);
            } while (left = left.prevSibling);
        }
        if (right) {
            do {
                result.tail.push(right);
            } while (right = right.nextSibling);
        }

        if (!this.parent) {
            const splitNode = this.locate(start, end, false);
            const { head, tail, inner } = splitNode.split(start, end);
            result.inner = inner;
            inner.parent = null;
            this.children = [
                ...head,
                inner,
                ...tail
            ];
            for (let i = 0; i < this.children.length; i++) {
                const current = this.children[i];
                if (i > 0) current.#prev = this.children[i - 1] ;
                else current.#prev = null;
                if (i < this.children.length - 1) current.#next = this.children[i + 1];
                else current.#next = null;
            }
        } else {
            if (this.isTerminal) {
                if (this.start === start && this.end === end) {
                    result.inner = this;
                } else {
                    const sliced = this.slice(start, end, true);
                    if (!sliced.target) {
                        throw new Error('zero-width slice prohibited here');
                    }
                    result.inner = sliced.target;
                    if (sliced.head) {
                        sliced.head.#next = null;
                        result.head.push(sliced.head);
                    }
                    if (sliced.tail) {
                        sliced.tail.#prev = null;
                        result.tail.unshift(sliced.tail);
                    }
                }
            } else {
                const splitNode = this.locate(start, end, false);
                const { head, tail, inner: target } = splitNode.split(start, end);
                result.inner = target;

                if (head.length) {
                    const text = [];
                    const concat = this.clone();
                    for (let i = 0; i < head.length; i++) {
                        const current = head[i];
                        if (i > 0) current.#prev = head[i - 1] ;
                        else current.#prev = null;
                        if (i < head.length - 1) current.#next = head[i + 1];
                        else current.#next = null;
                        text.push(current.text);
                        concat.children.push(current);
                        current.parent = concat;
                    }
                    concat.start = head[0].start;
                    concat.end = head[head.length - 1].end;
                    concat.text = text.join('');
                    result.head.push(concat);
                }
                if (tail.length) {
                    const text = [];
                    const concat = this.clone();
                    for (let i = 0; i < tail.length; i++) {
                        const current = tail[i];
                        if (i > 0) current.#prev = tail[i - 1];
                        else current.#prev = null;
                        if (i < tail.length - 1) current.#next = tail[i + 1];
                        else current.#next = null;
                        text.push(current.text);
                        concat.children.push(current);
                        current.parent = concat;
                    }
                    concat.start = tail[0].start;
                    concat.end = tail[tail.length - 1].end;
                    concat.text = text.join('');
                    result.tail.unshift(concat);
                }
            }
        }

        return result;
    }

    walk(visitor: ScopeNodeVisitor, parentHandle?: ScopeNodeWalker): void {
        let skippedChildren = false;
        let skippedSiblings = false;
        let aborted = false;

        const handle = {
            abort(): void {
                aborted = true;
                if (parentHandle) {
                    parentHandle.abort();
                }
            },
            skipChildren(): void {
                skippedChildren = true;
            },
            skipSiblings(): void {
                skippedSiblings = true;
                if (parentHandle) {
                    parentHandle.skipChildren();
                }
            }
        };

        visitor.call(handle, this, handle);
        for (const child of this.children) {
            if (aborted) break;
            if (skippedSiblings) break;
            if (skippedChildren) break;
            child.walk(visitor, handle);
        }
    }

    serialize(): SerializedScopeNode {
        if (this.isTerminal) return [this.kind, this.text];
        else return [
            this.kind,
            this.children.map(child => child.serialize())
        ];
    }
}

function interpretShorthandArgs(...args: any[]): [start: number, end: number, option?: boolean] {
    if (args.length === 1 && typeof args[0] === 'object') {
        return [args[0].start, args[0].end];
    } else if (args.length === 2 || args.length === 3) {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            if (args.length === 3) {
                if (typeof args[2] === 'boolean') {
                    return [args[0], args[1], args[2]];
                } else {
                    throw new Error('Incorrect call signature.');
                }
            } else {
                return [args[0], args[1]];
            }
        } else if (args.length == 2 && typeof args[0] === 'object' && typeof args[1] === 'boolean') {
            return [args[0].start, args[0].end, args[1]];
        } else {
            throw new Error('Incorrect call signature.');
        }
    } else {
        throw new Error('Incorrect call signature.');
    }
}

export default ScopeNode;
