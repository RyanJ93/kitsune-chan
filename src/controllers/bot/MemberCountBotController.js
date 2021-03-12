'use strict';

const BotController = require('./BotController');
const LocaleManager = require('../../support/LocaleManager');
const UsageBotException = require('../../exceptions/UsageBotException');
const MemberCountService = require('../../services/MemberCountService');

class MemberCountBotController extends BotController {
    async counter(){
        const args = this._message.cleanedContent.split(' ').filter((argument) => argument !== '').map((argument) => {
            return argument.trim().toLowerCase();
        });
        if ( !MemberCountService.isSupportedChannel(args[0]) ){
            throw new UsageBotException('11');
        }
        const enabled = args[1] === 'on' ? true : ( args[1] === 'off' ? false : null );
        if ( enabled === null ){
            throw new UsageBotException('ddd');
        }
        const memberCountService = new MemberCountService(this._guildConfig.getGuildID());
        await memberCountService.setCounterEnabled(args[1], enabled);
        await this._reply('ddd');
    }

    async counterName(){
        const index = this._message.cleanedContent.indexOf(' ');
        const counter = index === -1 ? this._message.cleanedContent : this._message.cleanedContent.substr(0, index);
        const name = index === -1 ? '' : this._message.cleanedContent.substr(index + 1);
        if ( !MemberCountService.isSupportedChannel(counter) ){
            throw new UsageBotException('11');
        }
        if ( name === '' ){
            throw new UsageBotException('ddd');
        }
        const memberCountService = new MemberCountService(this._guildConfig.getGuildID());
        await memberCountService.setCounterName(counter, name);
        await this._reply('ddd');
    }
}

module.exports = MemberCountBotController;
