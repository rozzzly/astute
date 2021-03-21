import { Ranged } from './ScopeNode';

export const dumbAssert: <T>(value: unknown) => asserts value is T = (value) => {};

/**
 * `@babel/types` defines `.start` and `.end` on `BaseNode` as `number | null` which does not
 * play nice with `strict` as `true` in `tsconfig.json`. AFAICT, those will only be `null` when
 * manipulating the AST (not when just parsing it) which is outside the scope of `astute` so
 * would never be the case during runtime.
 *
 * This can't really be resolved by module augmentation because merging interfaces doesn't allow
 * for narrowing a property's type. Moreover, `BaseNode` is not even exposed. Another option would
 * be to have a custom version of `@babel/types`, perhaps a script that patches the `.d.ts` but
 * that's brittle and hacky.
 *
 * Also considered changing the signatures of some `ScopeNode`'s shorthand overloads such as
 * `findAndSlice<R extends Range>(range: R): ScopeNode` to something like:
 * `findAndSlice<R extends RangeWeak>(range: R): ScopeNode` where `RangeWeak` has
 * `.start` and `.end` as `number | null`. However, this falls short when the `start` and
 * `end` params need to be explicitly passed (eg: when using offsets such as `.slice(node.start + 1, node.end - 1)`).
 *
 * The more annoying, but maintainable way is to cast variables whenever they're in scope. For example:
 * ```ts
 *  parse(srcText, {
 *      StringLiteral: ({ node }) => {
 *          this.findAndSlice(node); // Assignability error because `number | null` cannot be assigned to `number`
 *          /// so the solution is to do this:
 *          castAsRanged(node); // narrows from `number | null` to `number`
 *          this.findAndSlice(node); // no error
 *      }
 * })
 * ```
 * Will evaluate using a babel plugin such as `babel-plugin-strip-function-call` to strip these
 * calls from emitted code because they're just NOOPs at runtime.
 */
export const castAsRanged: <R>(value: unknown) => asserts value is (
    & Omit<R, 'start' | 'end'>
    & Ranged
) = (value) => {};


/**
 * Runtime check/typeguard to determine if value is a RegExp
 */
export const isRegExp = (value: unknown): value is RegExp => (
    Object.prototype.toString.call(value) === '[object RegExp]'
);


/**
 * Require `T` to have at least one of the properties specified by the union `Keys`
 * @see https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist/49725198#49725198
 */
export type RequireSome<T, Keys extends keyof T = keyof T> = (
    & Pick<T, Exclude<keyof T, Keys>>
    & ({
        [K in Keys]-?: (
            & Required<Pick<T, K>>
            & Partial<Record<Exclude<Keys, K>, undefined>>
        );
    })[Keys]
);