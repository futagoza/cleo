import camelcase from "camelcase";

let KEY_CACHE: { [ argKey: string ]: string } = {};

/**
 * A wrapper around [camelcase](https://github.com/sindresorhus/camelcase#readme) that will:
 * 
 * 1. Return converted value from cache if present
 * 2. Strip `--no-` if found at the start
 * 3. Convert using `camelcase` and cache result
 * 4. Return from cache
 */

export function camelcache( argKey: string ) {

    if ( ! KEY_CACHE[ argKey ] ) camelcache.set( argKey );

    return KEY_CACHE[ argKey ];

}

/**
 * 1. Strip `--no-` if found at the start
 * 2. Convert using [camelcase](https://github.com/sindresorhus/camelcase#readme) and cache result
 */

camelcache.set = ( argKey: string ) => {

    if ( argKey.startsWith( "--no-" ) ) argKey = argKey.slice( 5 );

    KEY_CACHE[ argKey ] = camelcase( argKey, { pascalCase: false } );

};

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

    if ( KEY_CACHE?.[ argKey ] ) delete KEY_CACHE[ argKey ];

};
