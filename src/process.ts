import { info, error } from "./log";

/**
 * Will kill the current process under the assumption of an error, optionally printing a message.
 */

export function abort( message?: unknown, ...optionalParams: unknown[] ) {

    if ( message ) error( message, ...optionalParams );
    process.exit( 1 );

}

/**
 * Will stop the current process, optionally printing a message first.
 */

export function close( message?: unknown, ...optionalParams: unknown[] ) {

    if ( message ) info( message, ...optionalParams );
    process.exit( 0 );

}
