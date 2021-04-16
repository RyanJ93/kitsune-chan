'use strict';

const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const BotException = require('../../exceptions/BotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');
const { MessageEmbed, Message } = require('discord.js');
const MemberCountCounterSet = require('../../models/MemberCountCounterSet');

class GuildBotController extends BotController {
    async serverinfo() {
        let server = message.member.guild;

        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(this._guild.id);
        const labels = LocaleManager.getLabelMulti([
            'guild.serverinfo.serverOwnerUserUsername',
            'guild.serverinfo.serverRegion',
            'guild.serverinfo.memberCountCounterSetGetUserCount',
            'guild.serverinfo.memberCountCounterSetGetChannelCount',
            'guild.serverinfo.serverCreatedToDateString',
            'guild.serverinfo.serverPremiumTier',
            'guild.serverinfo.serverPremiumSubscriptionCount'
        ], this._locale);
        let embed = new MessageEmbed()
        set.Title(server.name)
        .set.Description("Tutte le info su questo server")
        .setThumbnail(server.iconURL())
        .addField("Owner", "```" + server.owner.user.username + "```", true)
        .addField("Server region", "```" + server.region + "```", true)
        .addField("Utenti", memberCountCounterSet.getUserCount(), false)
        .addField("Canali", memberCountCounterSet.getChannelCount(), false)
        .addField("Server created", "```Category: " + server.created.toDateString() + "```", true)
        .addField("Boost level", "```Level " + server.premiumTier + " (Boost: " + server.premiumSubscriptionCount + ")```", true)

        message.channel.send(embed);
    }
};

module.exports = GuildBotController;
