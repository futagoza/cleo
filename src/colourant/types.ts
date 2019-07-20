import codes from "./codes";
import styler from "./styler";

/**
 * Represent's 2 numbers describing the start and end of a style.
 */

export type CodeGroup = [ number, number ];

/**
 * Represent's a map of codegroups, numbers that describe the start and end of a style.
 */

export type CodeGroupMap<T> = { [ K in keyof T ]: CodeGroup; };

/**
 * Input to be transformed.
 */

export type Input = string | number;

/**
 * Represent's a string transformer.
 */

export type Transformer = ( input: Input ) => string;

/**
 * Represent's a map of string transformers.
 */

export type TransformerMap<T> = { [ K in keyof T ]: Transformer; };

/**
 * Describes an object that is used to transform an input.
 */

export type TransformData = {

    open: string;
    close: string;

    escape: Transformer;

};

/**
 * Represent's a function that can either transform a string, or returns chainable transformers.
 */

export type ChainTransformer<T> = {

    /**
     * Transform a string.
     */

    ( input: Input ): string;

    /**
     * Chainable string transformers.
     */

    (): ChainableTransformer<T>;

};

/**
 * Represent's a map of chainable transformers.
 */

export type ChainTransformerMap<T> = {

    [ K in keyof T ]: ChainTransformer<T>;

};

/**
 * Represent's a chainable transformer that also doubles as a map of chainable transformers.
 */

export type ChainableTransformer<T> = ChainTransformer<T> & ChainTransformerMap<T>;

/**
 * Default style codes used by cleo.colourant
 * 
 * Plucked from https://github.com/lukeed/kleur/blob/master/test/codes.js
 */

export type DefaultCodes = typeof codes;

/**
 * `cleo.colourant` API
 */

export interface ColourantAPI extends ChainTransformerMap<DefaultCodes> {

    /**
     * Create a string transformer from multiple code groups.
     */

    ( ...codegroups: CodeGroup[] ): Transformer;

    /**
     * Represent's a function that create's a string transformer from a codegroup.
     */

    from: typeof styler.from;

    /**
     * Ensure's that transformer's from `cleo.colourant.styler` _apply thier transform's_.
     */

    enable(): ColourantAPI;

    /**
     * Ensure's that transformer's from `cleo.colourant.styler` _don't apply thier transform's_.
     */

    disable(): ColourantAPI;

    /**
     * Simple, non-chainable string transformer to color a string representaion of a date or time.
     *
     * Default color: __gray__ / __grey__
     */

    time: Transformer;

    /**
     * Simple, non-chainable string transformer to color _informative_ text.
     *
     * Default color: __white__
     */

    info: Transformer;

    /**
     * Simple, non-chainable string transformer to color text that conveys a _warning_ to the end user.
     *
     * Default color: __yellow__
     */

    warning: Transformer;

    /**
     * Simple, non-chainable string transformer to color text that conveys an _error_ has accured.
     *
     * Default color: __red__
     */

    error: Transformer;

}
