import { log } from "../src";
import { EOL } from "os";
import colourant = require( "colourant" );
import dateformat = require( "dateformat" );
import {

    afterEach,
    beforeEach,
    serial as test,

} from "ava";

// 
// Bootstrap the console logger first (Ensuring logs are only intercepted during a test)
// 

const OrignalWriter = process.stdout.write.bind( process.stdout );
const FauxWriter = {

    active: false,

    output: [] as string[],

    write: function _write( data: string | Buffer, encoding?: string, cb?: () => unknown ) {

        // Fail-safe, just in case `process.stdout.write` hasn't been restored for some reason
        if ( ! FauxWriter.active ) return OrignalWriter( data as string, encoding, cb );

        if ( Buffer.isBuffer( data ) ) data = data.toString( "utf8" );
        FauxWriter.output[ FauxWriter.output.length ] = data;

        return true;

    } as typeof process.stdout.write,

    lastWrite() {

        return FauxWriter.output[ FauxWriter.output.length - 1 ];

    },

};

beforeEach( _t => {

    FauxWriter.active = true;

    process.stdout.write = FauxWriter.write;

} );
afterEach( _t => {

    FauxWriter.active = false;

    process.stdout.write = OrignalWriter;

} );

// 
// Tests
// 

test( "basic usage", t => {

    t.is( typeof log, "object" );

} );

test( "log.echo", t => {

    log.echo( "test 123" );

    t.is( FauxWriter.lastWrite(), "test 123" );

} );

test( "log.print", t => {

    log.print( "test 123" );

    t.is( FauxWriter.lastWrite(), "test 123" + EOL );

} );

test( "log.appendTime", t => {

    const date = new Date();

    log.appendTime( date );

    t.is(

        FauxWriter.lastWrite(),
        `[${ colourant.grey( dateformat( date, "HH:MM:ss" ) ) }] `

    );

} );
