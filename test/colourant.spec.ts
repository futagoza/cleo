import colourant from "../src/colourant";
import test from "ava";

test( "basic usage", t => {

    const styled = colourant( [ 1, 22 ], [ 90, 39 ] );
    const simple = colourant.from( 90, 39 );

    t.snapshot( styled( "multi styled text" ) );
    t.snapshot( simple( "single styled text" ) );

} );

test( "enable/disable return the main function", t => {

    const keys = Object.keys( colourant );

    t.deepEqual( Object.keys( colourant.disable() ), keys );
    t.deepEqual( Object.keys( colourant.enable() ), keys );

} );

test( "builtin styles work", t => {

    t.snapshot( colourant.error( "red" ) );
    t.snapshot( colourant.info( "white" ) );
    t.snapshot( colourant.warning( "yellow" ) );
    t.snapshot( colourant.time( "grey" ) );

} );
