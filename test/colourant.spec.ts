import colourant from "../src/colourant";
import test from "ava";

test( "basic usage", t => {

    const styled = colourant( [ 1, 22 ], [ 90, 39 ] );
    const simple = colourant.simple( 90, 39 );

    t.is( typeof styled( "multi styled text" ), "string" );
    t.is( typeof simple( "single styled text" ), "string" );
    t.is( typeof colourant.disable(), "function" );
    t.is( typeof colourant.enable(), "function" );
    t.is( typeof colourant.error( "All hands on deck! An error has occured!" ), "string" );
    t.is( typeof colourant.info( "Ah, so that's what it's doing." ), "string" );
    t.is( typeof colourant.warning( "Looks like I should probally do something about this!" ), "string" );

} );
