'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const ChatController = require('../../controllers/bot/ChatController');

class ChatProvider extends lala.Provider {
    static async setup(){
        CommandRouter.registerCommand('say', ChatController, 'say');
    }
}

module.exports = ChatProvider;
