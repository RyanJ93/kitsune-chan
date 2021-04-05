'use strict';

const BotException = require('./BotException');

class UsageBotException extends BotException {
    constructor(message, code, exception){
        super(message, code, exception);
    }
}

module.exports = UsageBotException;
