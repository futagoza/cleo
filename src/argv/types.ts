/**
 * Can be passed in the arguments map as a property key to set the argv to process.
 * 
 * If not found in the arguments map, `visitArgv` will use `process.argv.slice( 2 )`
 */

export const ARGV = Symbol( "visitArgv argv" );

/**
 * Can be used as a property name in the argument's map to set a argument's key/value splitter.
 * 
 * _NOTE:_ By default this is set to `=` because that's a comman usage pattern.
 */

export const ASSIGNER = Symbol( "visitArgv key=value splitter" );

/**
 * If this is returned by a callback, `visitArgv` will end it's iteration.
 * 
 * _NOTE:_ If passed in the argument map as a property's key, the value will be used instead.
 */

export const BREAKER = Symbol( "visitArgv breaker" );

/**
 * If supplied in a arguments map, will be used to format the the name in `Argument#name`.
 */

export const FORMAT = Symbol( "visitArgv name formatter" );

/**
 * If set on the arguments map, will be immediatly invoked to preprocess the map.
 */

export const PREPROCESS = Symbol( "visitArgv arguments map preprocessor" );

/**
 * When passed in the arguments map as a property key, it's function will be called whenever
 * an unknown argument is found (an argument not defined in the same arguments map).
 */

export const UNKNOWN = Symbol( "visitArgv unknown" );

/**
 * An object that contains known arguments with their respective callbacks.
 *
 * If a string is provided instead of a callback, it will assume this is an alias for another option.
 */

export type ArgumentsMap = {

    [ argument: string ]: string | ( ( argument?: Argument ) => unknown );

    [ ARGV ]?: string[];

    [ ASSIGNER ]?: string;

    [ BREAKER ]?: unknown;

    [ FORMAT ]?: ( argument: string ) => string;

    [ PREPROCESS ]?: ( map: ArgumentsMap ) => ArgumentsMap;

    [ UNKNOWN ]?: ( argument?: Argument ) => unknown;

};

/**
 * A callback used for all arguments found by the `visitArgv` method.
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
     * The raw string of the current argument (e.g. `--use-strict=0`)
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
     * __NOTE:__ By default, this is a simple wrapper for [camelcase](https://github.com/sindresorhus/camelcase#readme):
     * 
     * ```js
     * camelcase( argument.key )
     * ```
     */

    readonly name: string;

    /**
     * If this argument was accessed using an alias, this will be here (the orignial argument)
     */

    readonly alias: string;

    /**
     * Will return `true` if the currect argument starts with one `-`
     */

    isShortFlag(): boolean;

    /**
     * Will return `true` if the currect argument starts with two `--`
     */

    isLongFlag(): boolean;

    /**
     * Check if the argument key starts with the given data.
     * 
     * A wrapper for:
     *
     * ```js
     * argument.key.startsWith( data )
     * ```
     */

    startsWith( data: string ): boolean;

    /**
     * Check if the argument key ends with the given data.
     *
     * A wrapper for:
     *
     * ```js
     * argument.key.endsWith( data )
     * ```
     */

    endsWith( data: string ): boolean;

    /**
     * Check if the argument key contains the given data.
     *
     * A wrapper for:
     *
     * ```js
     * argument.key.includes( data )
     * ```
     */

    includes( data: string ): boolean;

    /**
     * Will return the argument's value.
     * 
     * e.g. `--name=cleo` will have the value `cleo`
     * 
     * _NOTE:_ The `=` can be changed using a custom property on the arguments map:
     * 
     * ```js
     * {
     *  [ cleo.ASSIGN ]: ":",
     * }
     * ```
     * 
     * If the argument doesn't contain a `=`, then it will look at the next
     * argument and return that as the value (moving the argument parser's index forward) as long
     * as it doesn't start with a `-`
     *
     */

    value(): string | undefined;

    /**
     * Utility functions that make interacting with the following argument(s) trivial.
     */

    nextArg: {

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
     * If this is returned, `visitArgv` will end it's iteration.
     * 
     * _NOTE:_ Can be changed using a custom property on the arguments map:
     *
     * ```js
     * {
     *  [ cleo.BREAK ]: Symbol( "end iteration" ),
     * }
     * ```
     */

    readonly BREAK: unknown;

};

/**
 * A callback used by argument vistors returned from `cleo.proxy( target )`
 */

export type ArgumentTransformer<T = unknown> = {

    ( argument: Argument ): T;
    ( argument: Argument, previous?: T ): T;

};

/**
 * A callback used by argument processors  returned from `cleo.proxy( target )`
 */

export type ArgumentProcessor<T = unknown> = {

    ( argument?: string ): T;
    ( argument?: string, previous?: T ): T;

};
