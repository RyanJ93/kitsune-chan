'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const MemberCountBotController = require('../../controllers/bot/MemberCountBotController');
const MemberCountService = require('../../services/MemberCountService');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class MemberCountProvider extends lala.Provider {
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.memberCount.counter',
            'help.memberCount.counterName',
            'help.memberCount.refreshCounters',
            'help.memberCount.showCounters'
        ]);
        CommandRouter.registerCommand('counter', MemberCountBotController, 'counter', true);
        HelpService.registerCommand('counter', 'Member Count', labels['help.memberCount.counter']);
        CommandRouter.registerCommand('counter-name', MemberCountBotController, 'counterName', true);
        HelpService.registerCommand('counterName', 'Member Count', labels['help.memberCount.counterName']);
        CommandRouter.registerCommand('refresh-counters', MemberCountBotController, 'refreshCounters', true);
        HelpService.registerCommand('refreshCounters', 'Member Count', labels['help.memberCount.refreshCounters']);
        CommandRouter.registerCommand('show-counters', MemberCountBotController, 'showCounters');
        HelpService.registerCommand('showCounters', 'Member Count', labels['help.memberCount.showCounters']);
        const client = CommandRouter.getClient();
        MemberCountService.refreshEveryGuildCounters(client);
        MemberCountService.installObservers(client);
    }
}

module.exports = MemberCountProvider;
