'use strict';

const lala = require('@lala.js/core');

class BotException extends lala.Exception {
    constructor(message, code, exception){
        super(message, code, exception);
    }
}

module.exports = BotException;
