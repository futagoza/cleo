import { format } from "util";

/**
 * Define's a generic Set object with unkown types contained.
 */

export type GenericSet = Set<unknown>;

/**
 * An API that extends `Set` with methods that somewhat simplify list-like functionality.
 */

export class List extends Set<unknown> {

    /**
     * If the given object is a `List` instance, this will be returned, otherwise a new instance will be
     * created, optionally from the given object (will convert `Array` and `Set` to `List`).
     */

    static ensure( o?: unknown ) {

        if ( o instanceof List ) return o;

        const t = new List();
        if ( o != null ) t.absorb( o );
        return t;

    }

    /**
     * Return's a function that can be used as a callback to add values to a `List` or `Set`
     */

    static updater( o: List | GenericSet ) {

        return function __add( e: unknown ) { o.add( e ) };

    }

    /**
     * If given a `Set` or `Array` it will add their values into the current `List`
     * 
     * If any other type is passed, it will simply add it as a single value.
     * 
     * __WARNING:__ Ignore's `null` like values.
     */

    absorb( o?: unknown ) {

        if ( o instanceof Set || Array.isArray( o ) ) {

            o.forEach( ( entry: unknown ) => {

                if ( entry == null ) return;

                this.add( entry );

            } );

        } else if ( o != null ) {

            this.add( o );

        }

        return this;

    }

    /**
     * Will add values from the given `Set` or `Array` into the current `List`
     * 
     * If a string is given along with a separator, the string will be converted to an `Array`.
     */

    insert( o?: unknown, separator?: string | RegExp ) {

        if ( typeof o === "string" ) {

            if ( separator == null ) return this.add( o );

            o = o.split( separator );

        }

        return this.absorb( o );

    }

    /**
     * Will create a nicely formatted string from the values (optionally using the given config).
     * 
     * __Note:__ The default transformer use's Node's `util.format` and wraps the result in double commas.
     * 
     * ```js
     * const loaders = new List( [ "amd", "commonjs", "es", "umd" ] );
     * 
     * if ( ! loaders.has( USER_INPUT ) ) console.log( "Choose one of: " + loaders.format() );
     * 
     * // Will print:
     * // 
     * // Choose one of: "amd", "commonjs", "es" or "umd"
     * ```
     * 
     * @param transform A function that takes a value and returns a formatted variant of it
     * @param separator A string that will be used to separate each value _(default: `", "`)_
     * @param beforeLast A string used before the last value _(default: `" or "`)_
     */

    format( { transform = __formatChoice, separator = ", ", beforeLast = " or " } ) {

        const SIZE = this.size;

        let counter = 0;
        let result = "";

        this.forEach( value => {

            ++counter;

            if ( counter !== 1 ) {

                result += counter === SIZE ? beforeLast : separator;

            }

            result += transform( value );

        } );

        return result;

    }

    /**
     * Return's an array representation of this `List`/`Set`
     */

    toArray() {

        return Array.from( this );

    }

}

// 
// Internal
// 

function __formatChoice( value: unknown ) {

    return `"${ format( value ) }"`;

}
