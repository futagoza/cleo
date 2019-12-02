import {

    camelcache,

    Argument,
    ArgumentProcessor,
    ArgumentTransformer,
    ArgumentVisitor,

} from "./";

/**
 * Returns an API to assign proprties to the `target` object passed to `cleo.proxy( target )`
 *
 * Can be usefull when populating a `config`-like object using arguments from the CLI
 * before passing the object to a method in your library.
 * 
 * If no `format` method is provided, one that removes `--no-` and uses [camelcase](https://github.com/sindresorhus/camelcase#readme) is used.
 * 
 * @param target The object you wish to populate.
 * @param format A method to create property names from CLI keys.
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
     * Return's an argument visitor that will collect all values for the given option/flag into an array.
     * 
     * A function can be passed that tranforms the value before adding it to the collection.
     * 
     * If the argument is a RegExp or string, it will be used by the default transformer as a string splitter.
     * 
     * > cli -r custom-a --require custom-b,app-defaults
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
     * config.require === [ "app-defaults", "custom-a", "custom-b" ]
     * ```
     */

    collect(): ArgumentVisitor;
    collect<T>( transform: ( argument: Argument, previous?: T[] ) => T[] ): ArgumentVisitor;
    collect( separator: RegExp | string ): ArgumentVisitor;

    /**
     * Builds an argument processor that will throw when a value is provided to it's argument.
     * 
     * You can also pass a function that returns a value to use instead of `true`.
     * 
     * > cli -d
     *
     * ```js
     * const config = { debug: false }
     * const { flag, value } = cleo.proxy( config )
     * 
     * cleo.visitArgv( {
     *
     *     "-d": "--debug",
     *     "--debug": value( flag( () => 1 ) ),
     *
     * } )
     * 
     * config.debug === 1
     * ```
     */

    flag(): ArgumentTransformer<true>;
    flag<T>( cb: ( argument: Argument, previous?: T ) => T ): ArgumentTransformer<T>;

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
     *     "---": last(),
     *
     * } )
     *
     * config[ "---" ] === [ "-ds", "--mode", "mix" ]
     * ```
     */

    last(): ArgumentVisitor;
    last<T>( cb: ( argument: Argument, previous?: T ) => T ): ArgumentVisitor;

    /**
     * Return's an argument visitor that should only be called once. If a previous value is also given that means that it's been
     * called more then once, _but the previous value will not be overwritten (no error is thrown though)_. 
     * 
     * Also, the optional callback can double as a value transformer and an error reporter:
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
    once<T>( cb: ( argument: Argument, previous?: T ) => T ): ArgumentVisitor;

    /**
     * Builds an argument processor that transform's a value provided to it's argument.
     * 
     * If no value is present, but a `defaults` object is provided, this will be quered instead.
     * 
     * If no `defaults` object is provided, or theres no default for the option, an error is thrown.
     * 
     * _NOTE:_ A default can only be set for either the argument key or alias (takes precedence), not the _target key_.
     * 
     * > cli -d -r
     *
     * ```js
     * const config = { require: [], verbose: 0 }
     * const { collect, option, value } = cleo.proxy( config )
     *
     * const defaults = {
     *
     *     "-d": "3", // -d === full verbose logging mode
     *
     * }
     *
     * cleo.visitArgv( {
     *
     *     "-d": "--verbose",
     *     "--verbose": value( option( v => parseInt( v, 10 ), defaults ) ),
     *
     *     // this throws on no value
     *     "-r": "--require",
     *     "--require": collect( option( lookup ) ),
     *
     * } )
     * 
     * config.verbose === 3
     * ```
     */

    option<T>( transform: ( argument: string, previous?: T ) => T, defaults?: object ): ArgumentTransformer<T>;
    option( defaults?: object ): ArgumentTransformer;

    /**
     * Builds an argument processor that is _optionallly expecting_ a value provided to it's argument.
     *
     * > _[~/projects/cleo]_ cli -c
     *
     * ```js
     * const config = { configFile: false }
     * const { once, optional } = cleo.proxy( config )
     *
     * cleo.visitArgv( {
     *
     *     "-c, --config": "--config-file",
     *     "--config-file": once( optional( r => lookup( r ?? "cli.config.js" ) ) ),
     *
     * } )
     *
     * config.configFile === "~/projects/cleo/cli.config.js"
     * ```
     */

    optional<T>( transform: ( argument?: string, previous?: T ) => T ): ArgumentTransformer<T>;

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
    value<T>( cb: ( argument: Argument, previous?: T ) => T ): ArgumentVisitor;

    /**
     * A collection of methods usable as callbacks for argument vistors from `cleo.proxy`
     */

    readonly get: {

        optional: ArgumentTransformer<unknown>;
        required: ArgumentTransformer<unknown>;

        string: ArgumentTransformer<string>;
        number: ArgumentTransformer<number>;
        boolean: ArgumentTransformer<boolean>;
        date: ArgumentTransformer<string>;

        flag: ArgumentTransformer<boolean>;
        true: ArgumentTransformer<true>;
        false: ArgumentTransformer<boolean>;

        yes: ArgumentTransformer<boolean>;
        no: ArgumentTransformer<boolean>;

        rest: ArgumentTransformer<string[]>;

    };

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

        collect( transform?: ArgumentTransformer<unknown[]> | string | RegExp ) {

            const _transform = ( () => {

                if ( typeof transform === "function" ) return transform;

                const separator = transform || ",";

                return ( argument: Argument ) => {

                    const value = argument.value();

                    if ( ! value ) return [];

                    return value.split( separator ).map( s => s.trim() );

                };

            } )();

            return ( argument: Argument ) => {

                const option = format( argument.key );

                let collection: unknown[] = target[ option ];
                if ( ! Array.isArray( collection ) ) {

                    collection = target[ option ] = [ collection ] as unknown[];

                }

                _transform( argument, collection )

                    .forEach( value => {

                        if ( ! collection.includes( value ) ) collection.push( value );

                    } );

            };

        },

        flag<T>( transform?: ArgumentTransformer<T> ) {

            return ( argument: Argument, previous?: T ) => {

                const value = argument.value();

                if ( value != null ) throw new Error( `'${ argument.key }' does not expect a value!` );

                return transform ? transform( argument, previous ) : true;

            };

        },

        last( cb?: ArgumentTransformer ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );

                target[ option ] = cb ? cb( argument, target[ option ] ) : argument.nextArg.rest();

                return argument.BREAK;

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

        option( transform: ArgumentProcessor | object, defaults?: object ) {

            const _transform = ( () => {

                if ( typeof transform === "function" ) return transform;

                defaults = transform;

                return ( argument: string ) => argument;

            } )() as ArgumentProcessor;

            return ( argument: Argument, previous?: unknown ) => {

                const value = argument.value() ?? ( defaults?.[ argument.alias ] || defaults?.[ argument.key ] ) as string;

                if ( value == null ) throw new Error( `'${ argument.key }' expects a value!` );

                return _transform( value, previous );

            };

        },

        optional<T>( transform: ArgumentProcessor<T> ) {

            return ( argument: Argument, previous?: T ) => transform( argument.value(), previous );

        },

        value( cb?: ArgumentTransformer ) {

            return ( argument: Argument ) => {

                const option = format( argument.key );

                target[ option ] = cb ? cb( argument, target[ option ] ) : argument.value();

            };

        },

        get get() {

            const identity = ( value: unknown ) => value;

            return {

                optional: this.optional( identity ),
                required: this.option( identity ),

                string: this.option( String ),
                number: this.option( Number ),
                boolean: this.option( Boolean ),
                date: this.option( Date ),

                flag: this.flag( arg => ! arg.key.startsWith( "--no-" ) ),
                true: this.flag(),
                false: this.flag( () => false ),

                yes: this.option( v => v === "true" || v === "1" || v === "yes" ),
                no: this.option( v => v === "false" || v === "0" || v === "no" ),

                rest( arg: Argument ) {

                    return arg.nextArg.rest();

                },

            };

        },

    };

}
