import { Argument } from "../args/types";

export const convertors = {

    String( arg: Argument ) {

        return arg.value();

    },

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

    Boolean( arg: Argument ) {

        const value = arg.value();

        return value === "true" || value === "1" || value === "yes";

    },

    Flag( arg: Argument ) {

        return ! arg.key.startsWith( "--no-" );

    },

    Rest( arg: Argument ) {

        return arg.nextArg.rest();

    },

};
