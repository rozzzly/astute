const newLineRegExp = /(?<!\\)\n/g;
const singleQuoteRegExp = /(?<!\\)'/g;
const templateQuoteRegExp = /(?<!\\)`/g;

const serializer = ([kind, content], indent = 0, insertComma = false) => {
    const parts = [' '.repeat(indent) + `['${kind}', `];
    if (typeof content === 'string') {
        parts.push(`'${(content
            .replace(newLineRegExp, String.raw`\n`)
            .replace(singleQuoteRegExp, String.raw`\'`)
            .replace(templateQuoteRegExp, String.raw`\``)
        )}']`);
        if (insertComma) parts.push(',');
        parts.push('\n');
        return parts.join('');
    } else {
        parts.push('[\n');
        for (let i = 0; i < content.length; i++) {
            parts.push(serializer(content[i], indent + 4, i !== content.length - 1));
        }
        parts.push(' '.repeat(indent) + ']]');
        if (insertComma) parts.push(',');
        parts.push('\n');
        return parts.join('');
    }
};

const check = (val) => {
    if (Array.isArray(val) && val.length == 2) {
        if (typeof val[0] !== 'string') return false;
        if (typeof val[1] === 'string') return true;
        else if (Array.isArray(val[1])) {
            for (let child of val[1]) {
                if (!check(child)) return false;
            }
            return true;
        } else return false;
    }
};

module.exports = {
    test: (value) => check(value),
    serialize: (value) => serializer(value)
};