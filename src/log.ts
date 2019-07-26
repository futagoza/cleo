import colourant = require( "colourant" );
import dateformat = require( "dateformat" );
import { format } from "util";
import { EOL } from "os";

const __write = ( x: string ) => process.stdout.write( x, "utf8" );

/**
 * Will write to `stdout` _without a new line_.
 */

export function echo( message?: unknown, ...optionalParams: any[] ) {

    __write( format( message, ...optionalParams ) );

}

/**
 * Will write to `stdout` _with a new line_.
 */

export function print( message?: unknown, ...optionalParams: any[] ) {

    __write( format( message + EOL, ...optionalParams ) );

}

/**
 * Append either the given time, or if none provided, the current time.
 * 
 * @param time An optional JavaScript Date instance.
 * @param color The color to use on the appended date (default is _grey_).
 */

export const appendTime = ( ( time: Date | string = new Date(), color: string = "grey" ) => {

    if ( typeof time === "string" && color == null ) {

        color = time;
        time = new Date();

    }

    __write( `[${ colourant[ color ]( dateformat( time, "HH:MM:ss" ) ) }] ` );

} ) as {

    /**
     * Append the given time in either the optionally given color or `grey`
     */

    ( time: Date, color?: string ): void;

    /**
     * Append the current time in the given color
     */

    ( color: string ): void;

    /**
     * Append the current time in `grey`
     */

    (): void;

};

/**
 * Prettily log information to the console.
 */

export function info( ...data: any[] ) {

    appendTime( "time" );
    print( ...data );

}

/**
 * Prettily log a warning to the console.
 */

export function warning( ...data: any[] ) {

    appendTime( "warning" );
    print( ...data );

}

/**
 * Alias for `log.warning`
 */

export const warn = warning;

/**
 * Prettily log an error to the console.
 */

export function error( ...data: any[] ) {

    appendTime( "error" );
    print( ...data );

}

/**
 * Console logging functions.
 */

export const log = {

    echo,
    print,

    appendTime,

    info,
    warning,
    warn,
    error,

};
