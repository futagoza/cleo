/* Based on https://github.com/lukeed/kleur */

const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

let ENABLED = ! NODE_DISABLE_COLORS && TERM !== "dumb" && FORCE_COLOR !== "0";

function build( [ open, close ]: number[] ) {

    return {

        open: `\x1b[${ open }m`,
        close: `\x1b[${ close }m`,

        rgx: new RegExp( `\\x1b\\[${ close }m`, "g" ),

    };

}

export default function colourant( ...styles: number[][] ) {

    const data = styles.map( build );

    return ( target: string ) => {

        if ( ! ENABLED ) return target;

        let start = "";
        let end = "";

        for ( const { open, close, rgx } of data ) {

            start += open;
            end += close;

            if ( target.includes( close ) ) target = target.replace( rgx, close + open );

        }

        return start + target + end;

    };

}

colourant.simple = ( start: number, end: number ) => {

    const open = `\x1b[${ start }m`;
    const close = `\x1b[${ end }m`;

    const rgx = new RegExp( `\\x1b\\[${ end }]m`, "g" );

    return ( target: string ) => {

        if ( ! ENABLED ) return target;

        if ( target.includes( close ) ) target = target.replace( rgx, close + open );

        return open + target + close;

    };

};

colourant.enable = () => {

    ENABLED = true;

    return colourant;

};

colourant.disable = () => {

    ENABLED = false;

    return colourant;

};

/**
 * Default color: _gray_ / _grey_
 */

colourant.info = colourant.simple( 90, 39 );

/**
 * Default color: _yellow_
 */

colourant.warning = colourant.simple( 33, 39 );

/**
 * Default color: _red_
 */

colourant.error = colourant.simple( 31, 39 );
