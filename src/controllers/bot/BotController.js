'use strict';

const LocaleManager = require('../../support/LocaleManager');

class BotController {
    _client = null;
    _guildConfig = null;
    _message = null;
    _locale =  null;

    constructor(client, guildConfig, message){
        this._client = client;
        this._guildConfig = guildConfig;
        this._message = message;
        this._locale = LocaleManager.getLocaleByGuildMember(message.member);
    }
}

module.exports = BotController;
