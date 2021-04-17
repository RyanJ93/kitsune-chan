'use strict';

const lala = require('@lala.js/core');
const LocaleManager = require('../../support/LocaleManager');
const ChatService = require('../../services/ChatService');

class BotController {
    /**
     * @type {?module:"discord.js".Client}
     * @protected
     */
    _client = null;

    /**
     * @type {?module:"discord.js".Guild}
     * @protected
     */
    _guild = null;

    /**
     * @type {?module:"discord.js".TextChannel}
     * @protected
     */
    _channel = null;

    /**
     * @type {?GuildConfig}
     * @protected
     */
    _guildConfig = null;

    /**
     * @type {?module:"discord.js".Message}
     * @protected
     */
    _message = null;

    /**
     * @type {?string}
     * @protected
     */
    _locale =  null;

    _reply(message){
        if ( message === '' || typeof message !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid message.', 1);
        }
        return this._channel.send(message);
    }

    _replyWithDelay(message, delay = 2000){
        if ( message === '' || typeof message !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid message.', 1);
        }
        const chatService = new ChatService(this._guild);
        return chatService.type(message, this._channel, true, delay);
    }

    constructor(client, guildConfig, message){
        this._client = client;
        this._guild = message.guild;
        this._channel = message.channel;
        this._guildConfig = guildConfig;
        this._message = message;
        this._locale = LocaleManager.getLocaleByGuildMember(message.member);
    }
}

module.exports = BotController;
