// This file builds the `cleo.colourant` api that is exported

import chain from "./chain";
import codes from "./codes";
import styler from "./styler";

import {

    CodeGroup,
    ColourantAPI,

} from "./types";

export default ( () => {

    const colourant = ( ...codegroups: CodeGroup[] ) => styler( ...codegroups );

    Object.assign( colourant, chain.from( codes ) );

    colourant.from = styler.from;

    colourant.enable = () => {

        styler.enabled = true;

        return colourant;

    };

    colourant.disable = () => {

        styler.enabled = false;

        return colourant;

    };

    colourant.time = styler.from( 90, 39 );
    colourant.info = styler.from( 37, 39 );
    colourant.warning = styler.from( 33, 39 );
    colourant.error = styler.from( 31, 39 );

    return colourant as ColourantAPI;

} )();
