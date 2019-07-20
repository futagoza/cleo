// Some of these tests are modified versions from https://github.com/lukeed/kleur/blob/master/test/index.js

import test from "ava";

import {

    codes,
    colourant,
    styler,
    util,

    DefaultCodes,

} from "../src/colourant";

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

test( "built-in styles work", t => {

    t.snapshot( colourant.error( "red" ) );
    t.snapshot( colourant.info( "white" ) );
    t.snapshot( colourant.warning( "yellow" ) );
    t.snapshot( colourant.time( "grey" ) );

} );

test( "default cleo.colourant codes", t => {

    for ( const name of Object.keys( codes.all ) as Array<keyof DefaultCodes> ) {

        const style = colourant[ name ];

        t.is( typeof style, "function", "is a function" );
        t.is( typeof style().bold, "function", "~> and is chainable" );

        const [ start, end ] = codes.all[ name ];
        const result = style( "~foobar~" );

        t.is( typeof result, "string", "returns a string value" );
        t.is( result, util.ANSI( start ) + "~foobar~" + util.ANSI( end ), "~> matches expected" );

    }

} );

test( "chains", t => {

    const value = "~foobar~";

    t.snapshot( colourant.red().bold( value ) );
    t.snapshot( colourant.bold().yellow().bgRed().italic( value ) );
    t.snapshot( colourant.green().bold().underline( value ) );

} );

test( "nested", t => {

    t.snapshot( colourant.red( `foo ${ colourant.yellow( "bar" ) } baz` ) );
    t.snapshot( colourant.bold( `foo ${ colourant.red().dim( "bar" ) } baz` ) );
    t.snapshot( colourant.yellow( `foo ${ colourant.red().bold( "red" ) } bar ${ colourant.cyan( "cyan" ) } baz` ) );

} );

test( "integer", t => {

    t.snapshot( colourant.blue( 123 ), "~> basic" );
    t.snapshot( colourant.red().italic( 0 ), "~> chain w/ 0" );
    t.snapshot( colourant.italic( `${ colourant.red( 123 ) } ${ colourant.blue( 0 ) }` ), "~> chain w/ nested & 0" );
    t.snapshot( colourant.blue( -1 ), "~> basic w/ negatives" );

} );

test( "multiline", t => {

    t.snapshot( colourant.blue( "hello\nworld" ), "~> basic" );
    t.snapshot( colourant.blue().bold( "hello\nworld" ), "~> simple chain" );
    t.snapshot( colourant.italic().bold( `
        ${ colourant.red( "hello" ) }
        ${ colourant.blue( "world" ) }
    ` ), "~> chain w/ nested & string template" );

} );

test( "partial require", t => {

    const { red, bold, italic } = colourant;

    t.snapshot( red( "foo" ), "~> red()" );
    t.snapshot( bold( "bar" ), "~> bold()" );
    t.snapshot( italic( "baz" ), "~> italic()" );

    t.snapshot( red().bold().italic( "foo" ), "~> red().bold().italic()" );
    t.snapshot( red().bold().italic( "foo" ), "~> red().bold().italic() – repeat" );

    t.snapshot( bold().italic().red( "bar" ), "~> bold().italic().red()" );
    t.snapshot( bold().italic().red( "bar" ), "~> bold().italic().red() – repeat" );

    t.snapshot( italic().red().bold( "baz" ), "~> italic().red().bold()" );
    t.snapshot( italic().red().bold( "baz" ), "~> italic().red().bold() – repeat" );

    t.snapshot( red( "foo" ), "~> red() – clean" );
    t.snapshot( bold( "bar" ), "~> bold() – clean" );
    t.snapshot( italic( "baz" ), "~> italic() – clean" );


} );

test( "named chains", t => {

    const foo = colourant.red().bold;
    const bar = colourant.bold().italic().red;

    t.snapshot( colourant.red( "foo" ), "~> colourant.red() – clean" );
    t.snapshot( colourant.bold( "bar" ), "~> colourant.bold() – clean" );

    t.snapshot( foo( "foo" ), "~> foo()" );
    t.snapshot( foo( "foo" ), "~> foo() – repeat" );

    t.snapshot( bar( "bar" ), "~> bar()" );
    t.snapshot( bar( "bar" ), "~> bar() – repeat" );

    t.snapshot( colourant.red( "foo" ), "~> colourant.red() – clean" );
    t.snapshot( colourant.bold( "bar" ), "~> colourant.bold() – clean" );

} );

test( "toggleable styling", t => {

    t.true( colourant.enable() && styler.enabled );

    t.false( colourant.disable() && styler.enabled );
    t.is( colourant.red( "foo" ), "foo", "~> raw text only" );
    t.is( colourant.red().italic().bold( "foobar" ), "foobar", "~> chaining okay" );

} );
