import { serial as test } from "ava";
import { colourant } from "../src";

test( "basic usage", t => {

    t.is( typeof colourant, "function" );

} );
