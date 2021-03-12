'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const MemberCountBotController = require('../../controllers/bot/MemberCountBotController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class MemberCountProvider extends lala.Provider {
    static async setup(){
        CommandRouter.registerCommand('counter', MemberCountBotController, 'counter', true);
    }
}

module.exports = MemberCountProvider;
