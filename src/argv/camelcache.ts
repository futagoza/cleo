import camelcase from "camelcase";

let KEY_CACHE: { [ argKey: string ]: string } = {};

/**
 * A wrapper around [camelcase](https://github.com/sindresorhus/camelcase#readme) that will:
 * 
 * 1. Return converted argument key from cache if present
 * 2. Strip `--no-` if found at the start
 * 3. Convert using `camelcase` and cache result
 * 4. Return from cache
 */

export function camelcache( argKey: string ) {

    if ( ! KEY_CACHE[ argKey ] ) {

        const keyName = argKey.startsWith( "--no-" ) ? argKey.slice( 5 ) : argKey;

        KEY_CACHE[ argKey ] = camelcase( keyName, { pascalCase: false } );

    }

    return KEY_CACHE[ argKey ];

}

/**
 * If this method is given an argument, it will delete the cached value assoiciated with it.
 * 
 * If this method is provided no arguments, it will empty the cache.
 */

camelcache.clear = ( argKey?: string ) => {

    if ( argKey == null ) {

        KEY_CACHE = {};
        return;

    }

    if ( KEY_CACHE[ argKey ] ) delete KEY_CACHE[ argKey ];

};
