'use strict';

const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const BotException = require('../../exceptions/BotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');

class ChatController extends BotController {
    async say(){
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            await this._message.channel.send(this._message.cleanedContent);
        }
    }

    async help(){
        let message;
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            if ( !CommandRouter.commandExists(this._message.cleanedContent) ){
                throw new BotException(LocaleManager.getLabel('chat.help.commandNotFound', this._locale), 1);
            }
            message = HelpService.getHelpMessageContent(this._message.cleanedContent, this._locale);
        }else{
            message = HelpService.getHelpMessageContent(this._locale);
        }
        if ( message !== '' ){
            await this._message.channel.send(message);
        }
    }
}

module.exports = ChatController;
