'use strict';

const BotController = require('./BotController');

class ChatController extends BotController {
    async say(){
        await this._message.channel.send(this._message.cleanedContent);
    }
}

module.exports = ChatController;
