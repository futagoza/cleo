import { Argument } from "../args/types";

// TODO: Move methods to module scope

export const convertors = {

    // TODO: Rename to `Value`?

    String( arg: Argument ) {

        return arg.value();

    },

    // TODO: throw error on no value or nan?

    Number( arg: Argument ) {

        const value = arg.value();

        return value ? Number( value ) : void 0;

    },

    True() {

        return true;

    },

    False() {

        return false;

    },

    // TODO 1: Return false on: false, 0, no
    // TODO 2: throw error on other values?

    Boolean( arg: Argument ) {

        const value = arg.value();

        return value === "true" || value === "1" || value === "yes";

    },

    // TODO: throw error on value?

    Flag( arg: Argument ) {

        return ! arg.key.startsWith( "--no-" );

    },

    Rest( arg: Argument ) {

        return arg.nextArg.rest();

    },

};
