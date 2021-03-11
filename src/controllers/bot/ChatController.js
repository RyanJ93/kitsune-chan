'use strict';

const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');

class ChatController extends BotController {
    async say(){
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            await this._message.channel.send(this._message.cleanedContent);
        }
    }

    async help(){
        const message = HelpService.getHelpMessageContent('it');
        if ( message !== '' ){
            await this._message.channel.send(message);
        }
    }
}

module.exports = ChatController;
