/**
 * An object that contains known arguments with their respective callbacks.
 * 
 * If a string is provided instead of a callback, it will assume this is an alias for another option.
 */

export type ArgumentMap = { [ argument: string ]: string | ArgumentVisitor };

/**
 * A callback used for each argument, an `argv` element.
 */

export type ArgumentVisitor = ( argument: Argument ) => unknown;

/**
 * Describes the object passed to each argument visitor.
 */

export type Argument = {

    /**
     * A copy of the `argv` being being visited.
     */

    readonly argv: string[];

    /**
     * The raw string of the current argument (e.g. `--use-strict`)
     */

    readonly raw: string;

    /**
     * The current argument's index in the `argv` being visited
     */

    readonly index: number;

    /**
     * The raw string name of the current argument (e.g. `--use-strict`)
     */

    readonly key: string;

    /**
     * The formated string of the current argument (e.g. `useStrict` instead of `--use-strict`)
     * 
     * __NOTE:__ This is simply a wrapper for [camelcase](https://github.com/sindresorhus/camelcase#readme):
     * 
     * ```js
     * camelcase( argument.key )
     * ```
     */

    readonly name: string;

    /**
     * Will return `true` if the currect argument starts with `-`, but not `--`
     */

    isShortFlag(): boolean;

    /**
     * Will return `true` if the currect argument starts with `--`, but not `---`
     */

    isLongFlag(): boolean;

    /**
     * Will return the argument's value.
     * 
     * e.g. `--name=cleo` will have the value `cleo`
     * 
     * If the argument doesn't contain a `=` (which is a common case), then it will look at the next
     * argument and return that as the value (moving the argument parser's index forward) as long
     * as it doesn't start with `-`,
     *
     */

    value(): string | undefined;

    /**
     * Utility functions that make interacting with the following arguments trivial.
     */

    nextArg: NextArgumentVisitor;

    /**
     * If this symbol is returned, `visitArgv` will end it's iteration.
     */

    readonly BREAK: symbol;

};

/**
 * Represent's the `nextArg` function supplied to each argument callback.
 */

export type NextArgumentVisitor = {

    /**
     * Peek at the next argument in the provided `argv`
     */

    (): void | string;

    /**
     * Will check if the next argument exists. Can be used to see if `visitArgv` will continue.
     */

    exists(): boolean;

    /**
     * Return the next argument in the provided `argv`, while also moving the argument parser
     * forward (good for when you are expecting the next argument to be a value)
     */

    consume(): string;

    /**
     * Will return a copy of all the argument's starting from the next argument.
     */

    rest(): string[];

    /**
     * If you've used `nextArg.consume()`, this can reset the argument parser's index.
     */

    reset(): void;

};

/**
 * A callback used by methods returned from calling `cleo.proxy( target )`
 */

export type ArgumentTransformer<T = unknown> = {

    ( argument: Argument ): unknown;
    ( argument: Argument, previous: T ): unknown;

};
