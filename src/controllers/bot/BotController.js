'use strict';

const lala = require('@lala.js/core');
const LocaleManager = require('../../support/LocaleManager');

class BotController {
    _client = null;
    _guildConfig = null;
    _message = null;
    _locale =  null;

    async _reply(message){
        if ( message === '' || typeof message !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid message.', 1);
        }
        await await this._message.channel.send(message);
    }

    constructor(client, guildConfig, message){
        this._client = client;
        this._guildConfig = guildConfig;
        this._message = message;
        this._locale = LocaleManager.getLocaleByGuildMember(message.member);
    }
}

module.exports = BotController;
