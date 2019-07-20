import { BuildTransformData, BuildTransformer } from "./.internal/helpers";
import { CodeGroup, Transformer } from "./.internal/types";

/**
 * Create a string transformer from multiple code groups.
 * 
 * Based on code from https://github.com/lukeed/kleur
 */

export default function styler( ...codegroups: CodeGroup[] ): Transformer {

    let open = "";
    let close = "";

    const escapers = codegroups.map( codegroup => {

        const data = BuildTransformData( codegroup );

        open += data.open;
        close += data.close;

        return data.escape;

    } );

    return BuildTransformer( {

        open,
        close,

        escape( input: string ) {

            for ( const escape of escapers ) input = escape( input );

            return input;

        },

    } );

}

/**
 * When `false`, _cleo.colourant.styler_ will not apply transform's to any strings.
 */

styler.enabled = ( () => {

    const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

    return ! NODE_DISABLE_COLORS && TERM !== "dumb" && FORCE_COLOR !== "0";

} )();

/**
 * Represent's a function that create's a string transformer from a codegroup.
 */

styler.from = ( ( start: number | CodeGroup, end: number ): Transformer => {

    const codegroup = typeof start === "number" ? [ start, end ] : start;

    return BuildTransformer( BuildTransformData( codegroup as CodeGroup ) );

} ) as {

    /**
     * Create's a string transformer from the style's `start` and `end` numbers
     */

    ( start: number, end: number ): Transformer;

    /**
     * Create's a string transformer from a codegroup (e.g. `[start, end]`)
     */

    ( codegroup: CodeGroup ): Transformer;

};
