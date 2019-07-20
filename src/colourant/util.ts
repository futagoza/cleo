import styler from "./styler";
import {

    ChainableTransformer,
    CodeGroup,
    TransformData,
    Transformer,
    TransformerMap,

} from "./types";

/**
 * Builds the ANSI string for the given code.
 */

export const ANSI = ( x: number ) => `\x1b[${ x }m`;

/**
 * Build the strings and escape method required to transform input.
 * 
 * Based on code from https://github.com/lukeed/kleur
 */

export function BuildTransformData( [ start, end ]: CodeGroup ): TransformData {

    const open = ANSI( start );
    const close = ANSI( end );
    const rgx = new RegExp( `\\x1b\\[${ end }m`, "g" );

    return {

        open,
        close,

        escape( input: string ) {

            if ( input.includes( close ) ) return input.replace( rgx, close + open );

            return input;

        },

    };

}

/**
 * Build string transformer.
 * 
 * Based on code from https://github.com/lukeed/kleur
 */

export function BuildTransformer( { open, close, escape }: TransformData ): Transformer {

    return ( input: string ) => {

        if ( ! styler.enabled ) return input;

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return open + escape( input ) + close;

    };

}

/**
 * Build a chainable transformer that will apply the transforms in `cache`.
 */

export function BuildChainableTransformer<T>( transformers: TransformerMap<T>, cache: Transformer[] ) {

    function $( input?: string ) {

        if ( input == null ) return $;

        for ( const transform of cache ) input = transform( input );

        return input;

    }

    for ( const name of Object.keys( transformers ) ) {

        const transform: Transformer = transformers[ name ];

        $[ name ] = ( input?: string ) => {

            if ( input == null ) return BuildChainableTransformer<T>( transformers, [ ...cache, transform ] );

            for ( const _transform of cache ) input = _transform( input );

            return transform( input );

        };

    }

    return $ as ChainableTransformer<T>;

}
