'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const ChatBotController = require('../../controllers/bot/ChatBotController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');
const ChatService = require('../../services/ChatService');

class ChatProvider extends lala.Provider {
    /**
     *
     * @return {Promise<void>}
     */
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.chat.say',
            'help.chat.help',
            'help.chat.info',
            'help.chat.type',
            'help.chat.target',
            'help.chat.animatedEmoji',
            'help.chat.emojiReact'
        ]);
        CommandRouter.registerCommand('say', ChatBotController, 'say');
        HelpService.registerCommand('say', 'Chat', labels['help.chat.say']);
        CommandRouter.registerCommand('help', ChatBotController, 'help');
        HelpService.registerCommand('help', 'Chat', labels['help.chat.help']);
        CommandRouter.registerCommand('info', ChatBotController, 'info');
        HelpService.registerCommand('info', 'Chat', labels['help.chat.info']);
        CommandRouter.registerCommand('target', ChatBotController, 'target');
        HelpService.registerCommand('target', 'Chat', labels['help.chat.target']);
        CommandRouter.registerCommand('type', ChatBotController, 'type');
        HelpService.registerCommand('type', 'Chat', labels['help.chat.type']);
        CommandRouter.registerCommand('animated-emoji', ChatBotController, 'animatedEmoji');
        HelpService.registerCommand('animatedEmoji', 'Chat', labels['help.chat.animatedEmoji']);
        CommandRouter.registerCommand('emoji-react', ChatBotController, 'emojiReact');
        HelpService.registerCommand('emojiReact', 'Chat', labels['help.chat.emojiReact']);
        ChatService.installMiddleware(CommandRouter.getClient());
    }
}

module.exports = ChatProvider;
