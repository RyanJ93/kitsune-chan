'use strict';

const lala = require('@lala.js/core');
const Database = require('../support/Database');

class DatabaseProvider extends lala.Provider {
    static async setup(){
        await Database.setup();
    }
}

module.exports = DatabaseProvider;
