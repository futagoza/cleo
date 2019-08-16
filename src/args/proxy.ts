import {

    camelcache,
    List,

    Argument,
    ArgumentTransformer,
    ArgumentVisitor,

} from "../";

/**
 * Will return functions that make it easier setting properties on `target`
 * 
 * Can be usefull when populating a `config`-like object using arguments from the CLI
 * before passing it to a method in your library.
 * 
 * If no `format` method is provided, one that removes `--no-` and uses [camelcase](https://github.com/sindresorhus/camelcase#readme) is used.
 * 
 * @param target The object you wish to populate.
 * @param format A method to create property names.
 */

export function proxy<T>( target: T, format: ( argKey: string ) => string = camelcache ): {

    /**
     * A getter that returns the target object. Usefull when your passing a raw object to `cleo.proxy`:
     * 
     * ```js
     * const { config } = cleo.proxy( { name: "node" } )
     * 
     * config.name === "node"
     * ```
     */

    readonly config: T;

    /**
     * Get the current value for the property of the given argument:
     * 
     * > cli --name cleo
     * 
     * ```js
     * const config = { name: "node" }
     * const { Get } = cleo.proxy( config )
     * 
     * Get( "--name" ) === "node"
     * ```
     */

    Get( argKey: string ): unknown;

    /**
     * Set the current value for the property of the given argument:
     * 
     * ```js
     * const config = { name: "node" }
     * const { Set } = cleo.proxy( config )
     * 
     * Set( "--name", "cleo" )
     * 
     * config.name === "cleo"
     * ```
     */

    Set( argKey: string, newValue: unknown ): void;

    /**
     * Return's an argument visitor that will assign a property on the proxy'ed target.
     * 
     * If no callback is provided, this simply gets the next value.
     * 
     * > cli --name cleo
     * 
     * ```js
     * const config = { name: "node" }
     * const { value } = cleo.proxy( config )
     * 
     * cleo.visitArgv( {
     * 
     *     "--name": value(),
     * 
     * } )
     * 
     * config.name === "cleo"
     * ```
     */

    value(): ArgumentVisitor;
    value<T = unknown>( cb: ArgumentTransformer<T> ): ArgumentVisitor;

    /**
     * Return's an argument visitor that will collect all values for the given option/flag into a `List`:
     * 
     * > cli -r custom-a --require custom-b
     * 
     * ```js
     * const config = { require: [ "app-defaults" ] }
     * const { collect } = cleo.proxy( config )
     * 
     * cleo.visitArgv( {
     * 
     *     "-r": "--require",
     *     "--require": collect(),
     * 
     * } )
     * 
     * config.require.toArray() === [ "app-defaults", "custom-a", "custom-b" ]
     * ```
     */

    collect(): ArgumentVisitor;
    collect( cb: ArgumentTransformer<List> ): ArgumentVisitor;
    collect( cb: ArgumentTransformer<List>, separator: RegExp ): ArgumentVisitor;
    collect( cb: ArgumentTransformer<List>, separator: string ): ArgumentVisitor;

    /**
     * Return's an argument visitor that should only be called once. If a previous value is also given that means that it's been
     * called more then once, but the previous value will not be overwritten. tldr; The `cb` can double as an error reporter:
     * 
     * > cli -m fast --mode mix
     *
     * ```js
     * const { config, once } = cleo.proxy( {} )
     *
     * cleo.visitArgv( {
     *
     *     "-m": "--mode",
     *     "--mode": once( ( argument, previous ) => {
     * 
     *         if ( previous ) throw new Error( "--mode can only be called once." );
     * 
     *         return argument.value();
     * 
     *     } ),
     *
     * } )
     * ```
     */

    once(): ArgumentVisitor;
    once<T = unknown>( cb: ArgumentTransformer<T> ): ArgumentVisitor;

    /**
     * Return's an argument visitor that will stop the argv parsing when the given argument key is found.
     * 
     * If no `cb` is provided, by default this will also assign the remaining arguments to the given key.
     * 
     * > cli build --- -ds --mode mix
     *
     * ```js
     * const { config, last } = cleo.proxy( {} )
     *
     * cleo.visitArgv( {
     *
     *     "---": last( cleo.convertors.Rest ),
     *
     * } )
     *
     * config[ "---" ] === [ "-ds", "--mode", "mix" ]
     * ```
     */

    last(): ArgumentVisitor;
    last<T = unknown>( cb: ArgumentTransformer<T> ): ArgumentVisitor;

} {

    return {

        get config() {

            return target;

        },

        Get( argKey ) {

            return target[ format( argKey ) ];

        },

        Set( argKey, newValue ) {

            target[ format( argKey ) ] = newValue;

        },

        value( cb?: ArgumentTransformer ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );

                target[ option ] = cb ? cb( argument, target[ option ] ) : argument.value();

            };

        },

        collect( cb?: ArgumentTransformer<List>, separator?: string | RegExp ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );
                const o = List.ensure( target[ option ] );

                target[ option ] = o.insert( cb ? cb( argument, o ) : argument.value(), separator );

            };

        },

        once( cb?: ArgumentTransformer ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );

                if ( target[ option ] != null ) {

                    if ( cb ) cb( argument, target[ option ] );
                    return;

                }

                target[ option ] = cb ? cb( argument ) : argument.value();

            };

        },

        last( cb?: ArgumentTransformer ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );

                target[ option ] = cb ? cb( argument, target[ option ] ) : argument.nextArg.rest();

                return argument.BREAK;

            };

        },

    };

}
