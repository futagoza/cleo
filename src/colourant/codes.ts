import { CodeGroupMap } from "./.internal/types";

/**
 * Text modifiers
 */

export const modifiers = {

    reset: [ 0, 0 ],
    bold: [ 1, 22 ],
    dim: [ 2, 22 ],
    italic: [ 3, 23 ],
    underline: [ 4, 24 ],
    inverse: [ 7, 27 ],
    hidden: [ 8, 28 ],
    strikethrough: [ 9, 29 ],

};

/**
 * Text colors
 */

export const colors = {

    black: [ 30, 39 ],
    red: [ 31, 39 ],
    green: [ 32, 39 ],
    yellow: [ 33, 39 ],
    blue: [ 34, 39 ],
    magenta: [ 35, 39 ],
    cyan: [ 36, 39 ],
    white: [ 37, 39 ],
    gray: [ 90, 39 ],
    grey: [ 90, 39 ],

};

/**
 * Background colors
 */

export const background = {

    bgBlack: [ 40, 49 ],
    bgRed: [ 41, 49 ],
    bgGreen: [ 42, 49 ],
    bgYellow: [ 43, 49 ],
    bgBlue: [ 44, 49 ],
    bgMagenta: [ 45, 49 ],
    bgCyan: [ 46, 49 ],
    bgWhite: [ 47, 49 ],

};

/**
 * Default style codes used by `cleo.colourant`
 * 
 * Plucked from https://github.com/lukeed/kleur/blob/master/test/codes.js
 */

export const all = ( () => {

    // This has to be done like this, otherwise VS Code (or TypeScript?)
    // will loose track of the above comment information

    const codes = {

        ...modifiers,
        ...colors,
        ...background,

    };

    return codes as CodeGroupMap<typeof codes>;

} )();

export default all;
