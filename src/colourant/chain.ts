import styler from "./styler";
import { BuildChainableTransformer } from "./util";
import { CodeGroupMap, TransformerMap } from "./types";

/**
 * Build a chainable transformer for the given transformers.
 */

export default function chain<T>( transformers: TransformerMap<T> ) {

    return BuildChainableTransformer<T>( transformers, [] );

}

/**
 * Build a chainable transformer for the given code groups.
 */

chain.from = <T>( codes: CodeGroupMap<T> ) => {

    const transformers = {} as TransformerMap<T>;

    for ( const name of Object.keys( codes ) ) {

        transformers[ name ] = styler.from( codes[ name ] );

    }

    return BuildChainableTransformer<T>( transformers, [] );

};
