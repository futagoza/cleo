import camelcase from "camelcase";

import {

    ARGV,
    ASSIGNER,
    BREAKER,
    FORMAT,
    PREPROCESS,
    UNKNOWN,

    Argument,
    ArgumentVisitor,
    ArgumentsMap,

} from "./";

// 
// Default method called when an unkown argument is encountered
// 

function IGNORE_UNKOWN_METHOD() { }

// 
// Is used by `cleo.preprocessArgumentsMap` to auto-create aliases
// 

function ALIASER( visitors: ArgumentsMap, to: string ) {

    return ( from: string ) => { visitors[ from ] = to };

}

// 
// Recursively look for an alias's real callback, returning it or undefined
// 

function FIND_VISITOR( argument: string, known: ArgumentsMap ): [ string, ArgumentVisitor | undefined ] {

    const cb = known[ argument ];

    if ( typeof cb === "string" ) return FIND_VISITOR( cb, known );

    return [ argument, cb ];

}

// 
// Is defined here to avoid redefining it in every iteration of a arguments map
// 

function STRING_TRIMMER( s: string ) { return s.trim() }

/**
 * ```js
 * // Turns this:
 * {
 *     "-o, --out-dir": function visit() { ... },
 * }
 * 
 * // into:
 * {
 *     "-o": "--out-dir",
 *     "--out-dir": function visit() { ... },
 * }
 * ```
 */

export function preprocessArgumentsMap( map: ArgumentsMap ) {

    const visitors: ArgumentsMap = {};

    for ( let key in map ) {

        if ( ! map.hasOwnProperty( key ) ) continue;

        const mapKey = key;

        if ( typeof key === "string" && key.includes( "," ) ) {

            const parts = key.split( "," ).map( STRING_TRIMMER );

            key = parts.pop() as string;

            parts.forEach( ALIASER( visitors, key ) );

        }

        visitors[ key ] = map[ mapKey ];

    }

    return visitors;

}

/**
 * Iterate over `process.argv` while calling `known[arg.key](arg)`.
 * 
 * An example of how to use and customise (with the defaults shown as examples):
 * 
 * ```js
 * const cleo = require( "cleo" );
 * 
 * cleo.visitArgv( {
 * 
 *     // alias
 *     "-a": "--option",
 *     "--alias": "--option",
 * 
 *     // known argument callback
 *     "--option": ( arg ) => { ... },
 * 
 *     // change the `argv` being processed
 *     [ cleo.ARGV ]: process.argv.slice( 2 ),
 *
 *     // change the argument's key/value splitter
 *     [ cleo.ASSIGN ]: "=",
 *
 *     // change the breaker that should be returned for processing to stop
 *     [ cleo.BREAK ]: Symbol( "end iteration" ),
 *
 *     // an argument's key formatter used by `Argument#name`
 *     [ cleo.FORMAT ]: camelcase,
 *
 *     // can be used to preprocess the arguments map
 *     [ cleo.PREPROCESS ]: cleo.preprocessArgumentsMap,
 *
 *     // a function to call whenever an unknown argument is found
 *     [ cleo.UNKNOWN ]: function ignore() {},
 *
 *     // auto alias using the default preprocessor, cleo.preprocessArgumentsMap
 *     "-r, --require": ( arg ) => { ... },
 * 
 * } );
 * ```
 */

export function visitArgv( visitors: ArgumentsMap ): void;
export function visitArgv( visitor: ( argument: Argument ) => unknown ): void;

export function visitArgv( visitors: ArgumentsMap | ArgumentVisitor ) {

    if ( typeof visitors === "function" ) visitors = { [ UNKNOWN ]: visitors } as ArgumentsMap;
    visitors = ( visitors[ PREPROCESS ] ?? preprocessArgumentsMap )( visitors );

    const argv = visitors[ ARGV ] ?? process.argv.slice( 2 );
    const assigner = visitors[ ASSIGNER ] ?? "=";
    const breaker = visitors[ BREAKER ] ?? BREAKER;
    const format = visitors[ FORMAT ] ?? camelcase;
    const unkown = visitors[ UNKNOWN ] ?? IGNORE_UNKOWN_METHOD;

    const ARGV_LENGTH = argv.length;

    let index: number,
        argIndex: number,
        argAlias: string,
        argKey: string,
        argValue: string | string[],
        visit: ArgumentVisitor | undefined;

    const argument: Argument = {

        get argv() {

            return argv.slice( 0 );

        },

        get raw() {

            return argv[ argIndex ];

        },

        get index() {

            return argIndex;

        },

        get key() {

            return argKey;

        },

        get name() {

            return format( argKey );

        },

        get alias() {

            return argAlias;

        },

        isShortFlag() {

            const startWith = argKey.charAt( 0 );  // element[ 0 ]
            const followedBy = argKey.charAt( 1 ); // element[ 1 ]

            return startWith === "-" && followedBy !== "-";

        },

        isLongFlag() {

            const startWith = argKey.substr( 0, 2 ); // element[ 0 ] & element[ 1 ]
            const followedBy = argKey.charAt( 2 );   // element[ 2 ]

            return startWith === "--" && followedBy !== "-";

        },

        startsWith( data: string ) {

            return argKey.startsWith( data );

        },

        endsWith( data: string ) {

            return argKey.endsWith( data );

        },

        includes( data: string ) {

            return argKey.includes( data );

        },

        value() {

            // 
            // `argValue` is initilized as a `string[]`, so when the first call to `Argument#value()` is
            // made, this should be converted back to a string if it's bigger then `0` length.
            // 
            if ( Array.isArray( argValue ) ) {

                if ( argValue.length === 0 ) {

                    const _value = argv[ argIndex + 1 ];

                    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
                    if ( _value.charAt( 0 ) === "-" ) return void 0;

                    argValue = _value;

                    // An `if` guard is needed in case `nextArg.consume()` has been used
                    if ( index === argIndex ) ++index;

                } else {

                    argValue = argValue.join( assigner );

                }

            }

            return argValue;

        },

        nextArg: ( () => {

            function nextArg() {

                if ( index < ARGV_LENGTH ) return argv[ index + 1 ];

            }
            nextArg.exists = () => index < ARGV_LENGTH;
            nextArg.consume = () => argv[ ++index ];
            nextArg.rest = () => argv.slice( index + 1 );
            nextArg.reset = () => {

                index = argIndex;

            };

            return nextArg;

        } )(),

        get BREAK() {

            return breaker;

        },

    };

    for ( index = 0; index < ARGV_LENGTH; ++index ) {

        argIndex = index;

        [ argAlias, ...argValue ] = argv[ index ].split( assigner );
        [ argKey, visit ] = FIND_VISITOR( argAlias, visitors );

        if ( typeof visit === "function" ) {

            if ( visit( argument ) === breaker ) break;

            continue;

        }

        if ( unkown( argument ) === breaker ) break;

    }

}
