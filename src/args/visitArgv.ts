import camelcase from "camelcase";

import {

    Argument,
    ArgumentMap,
    ArgumentVisitor,

} from "./types";

/**
 * If this is returned by `cb`, `visitArgv` will end it's iteration.
 */

export const BREAK = Symbol( "processArgv break" );

// 
// Recursively look for an alias's real callback, returning it or undefined
// 

function FIND_VISITOR( argKey: string, known: ArgumentMap ): ArgumentVisitor | void {

    const cb = known[ argKey ];

    if ( typeof cb === "string" ) return FIND_VISITOR( cb, known );

    return cb;

}

// 
// This is the real argv visitor. The exported `visitArgv` method normalizes the arguments
// before invoking this private method.
// 

function VISIT_ARGV( argv: string[], known: ArgumentMap, unkown: ArgumentVisitor ) {

    const ARG_COUNT = argv.length;
    const VISITING_KNOWN_ARGS = Object.keys( known ).length !== 0;

    let i: number, argIndex: number, argKey: string, argValue: string | string[];

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

            return camelcase( argKey );

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

                    // This guard is needed in case `nextArg.consume()` has been used
                    if ( i === argIndex )++i;

                } else {

                    argValue = argValue.join( "=" );

                }

            }

            return argValue;

        },

        nextArg: ( () => {

            function nextArg() {

                if ( i < ARG_COUNT ) return argv[ i + 1 ];

            }
            nextArg.exists = () => i < ARG_COUNT;
            nextArg.consume = () => argv[ ++i ];
            nextArg.rest = () => argv.slice( i + 1 );
            nextArg.reset = () => {

                i = argIndex;

            };

            return nextArg;

        } )(),

        get BREAK() {

            return BREAK;

        },

    };

    for ( i = 0; i < ARG_COUNT; ++i ) {

        argIndex = i;

        [ argKey, ...argValue ] = argv[ i ].split( "=" );

        if ( VISITING_KNOWN_ARGS ) {

            const visit = FIND_VISITOR( argKey, known );

            if ( typeof visit === "function" ) {

                if ( visit( argument ) === BREAK ) break;

                continue;

            }

        }

        if ( unkown( argument ) === BREAK ) break;

    }

}

/**
 * Iterate over `argv` while calling `cb(arg)` or `known[arg.value](arg)`.
 * 
 * If `argv` is a string, it will simply do `argv.split( " " )`, so it's better to pass an array.
 * 
 * If an object is passed as either the first or second paramter, it will be treated as a map of
 * known arguments and the next paramter will be expected to be an optional function called
 * when an unkown argument is found. This can be useful when collecting input file paths not
 * associated with any known arguments.
 */

export const visitArgv = ( ( argv: string | string[] | ArgumentMap | ArgumentVisitor, known?: ArgumentMap | ArgumentVisitor, unknown?: ArgumentVisitor ) => {

    let _argv = process.argv.slice( 2 );
    let _known = {} as ArgumentMap;
    let _unknown = ( () => void 0 ) as ArgumentVisitor;

    if ( typeof argv === "string" ) argv = argv.split( " " );

    if ( Array.isArray( argv ) ) {

        _argv = argv;

        if ( typeof known === "function" ) _unknown = known;

        else if ( typeof known === "object" ) {

            _known = known;

            if ( typeof unknown === "function" ) _unknown = unknown;

        }

    } else if ( typeof argv === "object" ) {

        _known = argv;

        if ( typeof known === "function" ) _unknown = known;

    } else if ( typeof argv === "function" ) _unknown = argv;

    VISIT_ARGV( _argv, _known, _unknown );

} ) as {

    ( argv: string | string[], cb: ArgumentVisitor ): void;

    ( argv: string | string[], known: ArgumentMap ): void;

    ( argv: string | string[], known: ArgumentMap, unknown: ArgumentVisitor ): void;

    ( cb: ArgumentVisitor ): void;

    ( known: ArgumentMap ): void;

    ( known: ArgumentMap, unknown: ArgumentVisitor ): void;

};
