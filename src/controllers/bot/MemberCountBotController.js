'use strict';

const { MessageEmbed } = require('discord.js');
const BotController = require('./BotController');
const LocaleManager = require('../../support/LocaleManager');
const UsageBotException = require('../../exceptions/UsageBotException');
const MemberCountService = require('../../services/MemberCountService');
const MemberCountCounterSet = require('../../models/MemberCountCounterSet');

class MemberCountBotController extends BotController {
    async counter(){
        const args = this._message.cleanedContent.split(' ').filter((argument) => argument !== '').map((argument) => {
            return argument.trim().toLowerCase();
        });
        if ( !MemberCountService.isSupportedChannel(args[0]) ){
            throw new UsageBotException(LocaleManager.getLabel('memberCount.counter.unsupportedCounter', this._locale), 1);
        }
        const enabled = args[1] === 'on' ? true : ( args[1] === 'off' ? false : null );
        if ( enabled === null ){
            throw new UsageBotException(LocaleManager.getLabel('memberCount.counter.unsupportedOperation', this._locale), 2);
        }
        const memberCountService = new MemberCountService(this._message.guild);
        await memberCountService.setCounterEnabled(args[0], enabled);
        await memberCountService.refreshCounters(true, true, true, true);
        const responseLabelID = enabled ? 'memberCount.counter.counterEnabled' : 'memberCount.counter.counterDisabled';
        await this._reply(LocaleManager.getLabel(responseLabelID, this._locale));
    }

    async counterName(){
        const index = this._message.cleanedContent.indexOf(' ');
        const counter = index === -1 ? this._message.cleanedContent : this._message.cleanedContent.substr(0, index);
        const name = index === -1 ? '' : this._message.cleanedContent.substr(index + 1);
        if ( !MemberCountService.isSupportedChannel(counter) ){
            throw new UsageBotException(LocaleManager.getLabel('memberCount.counter.unsupportedCounter', this._locale), 1);
        }
        if ( name === '' ){
            throw new UsageBotException(LocaleManager.getLabel('memberCount.counter.invalidName', this._locale), 2);
        }
        const memberCountService = new MemberCountService(this._message.guild);
        await memberCountService.setCounterName(counter, name);
        await memberCountService.refreshCounters(true, true, true, true);
        await this._reply(LocaleManager.getLabel('memberCount.counter.nameChanged', this._locale));
    }

    async refreshCounters(){
        const memberCountService = new MemberCountService(this._message.guild);
        await memberCountService.refreshCounters(true, true, true, true);
        await this._reply(LocaleManager.getLabel('memberCount.counter.countersRefreshStarted', this._locale));
    }

    async showCounters(){
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(this._guild.id, true);
        const messageEmbed = new MessageEmbed();
        const labels = LocaleManager.getLabelMulti([
            'memberCount.showCounters.description',
            'memberCount.showCounters.members',
            'memberCount.showCounters.users',
            'memberCount.showCounters.bot',
            'memberCount.showCounters.channels',
            'memberCount.showCounters.textChannels',
            'memberCount.showCounters.voiceChannels',
            'memberCount.showCounters.staticEmojis',
            'memberCount.showCounters.animatedEmojis',
            'memberCount.showCounters.emojis',
            'memberCount.showCounters.roles',
            'memberCount.showCounters.footer'
        ], this._locale);
        messageEmbed.setDescription(labels['memberCount.showCounters.description']);
        messageEmbed.addField(labels['memberCount.showCounters.members'], memberCountCounterSet.getMemberCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.users'], memberCountCounterSet.getUserCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.bot'], memberCountCounterSet.getBotCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.channels'], memberCountCounterSet.getChannelCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.textChannels'], memberCountCounterSet.getTextChannelCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.voiceChannels'], memberCountCounterSet.getVoiceChannelCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.staticEmojis'], memberCountCounterSet.getStaticEmojiCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.animatedEmojis'], memberCountCounterSet.getAnimatedEmojiCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.emojis'], memberCountCounterSet.getEmojiCount(), true);
        messageEmbed.addField(labels['memberCount.showCounters.roles'], memberCountCounterSet.getRoleCount(), true);
        messageEmbed.setFooter(labels['memberCount.showCounters.footer']);
        await this._message.channel.send(messageEmbed);
    }
}

module.exports = MemberCountBotController;
