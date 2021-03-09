'use strict';

class BotController {
    _client = null;
    _guildConfig = null;
    _message = null;

    constructor(client, guildConfig, message){
        this._client = client;
        this._guildConfig = guildConfig;
        this._message = message;
    }
}

module.exports = BotController;
