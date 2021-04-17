'use strict';

const BotController = require('./BotController');
const LocaleManager = require('../../support/LocaleManager');
const MemberCountCounterSet = require('../../models/MemberCountCounterSet');
const UsageBotException = require('../../exceptions/UsageBotException');
const DateUtils = require('../../support/DateUtils');
const { MessageEmbed } = require('discord.js');

class GuildBotController extends BotController {
    async serverinfo() {
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(this._guild.id);
        const labels = LocaleManager.getLabelMulti([
            'guild.serverinfo.description',
            'guild.serverinfo.owner',
            'guild.serverinfo.region',
            'guild.serverinfo.userCount',
            'guild.serverinfo.channelCount',
            'guild.serverinfo.emojiCount',
            'guild.serverinfo.createdAt',
            'guild.serverinfo.premiumTier',
            'guild.serverinfo.serverPremiumSubscriptionCount'
        ], this._locale);
        const messageEmbed = new MessageEmbed();
        messageEmbed.setTitle(this._guild.name);
        messageEmbed.setDescription(labels['guild.serverinfo.description']);
        messageEmbed.setThumbnail(this._guild.iconURL());
        const boostLevel = this._guild.premiumTier + ' (' + this._guild.premiumSubscriptionCount + ' boost)';
        const username = this._guild.owner.user.username + '#' + this._guild.owner.user.discriminator;
        const createdAt = DateUtils.stringifyDate(this._guild.createdAt, this._locale);
        messageEmbed.addField(labels['guild.serverinfo.owner'], "```" + username + "```", true);
        messageEmbed.addField(labels['guild.serverinfo.region'], "```" + this._guild.region + "```", true);
        messageEmbed.addField(labels['guild.serverinfo.premiumTier'], "```" + boostLevel + "```", true);
        messageEmbed.addField(labels['guild.serverinfo.userCount'], memberCountCounterSet.getUserCount(), true);
        messageEmbed.addField(labels['guild.serverinfo.channelCount'], memberCountCounterSet.getChannelCount(), true);
        messageEmbed.addField(labels['guild.serverinfo.emojiCount'], '-', true);
        messageEmbed.addField(labels['guild.serverinfo.createdAt'], "```" + createdAt + "```", false);
        this._channel.send(messageEmbed);
    }

    async prefix(){
        const prefix = this._message.cleanedContent.trim();
        if ( prefix === '' || prefix.indexOf(' ') >= 0 || prefix.length > 10 ){
            throw new UsageBotException(LocaleManager.getLabel('guild.prefix.invalidPrefix', this._locale));
        }
        await this._guildConfig.setPrefix(prefix).save();
        await this._reply(LocaleManager.getLabel('guild.prefix.prefixChanged', this._locale));
    }
}

module.exports = GuildBotController;
