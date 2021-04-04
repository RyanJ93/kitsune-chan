'use strict';

const { MessageEmbed } = require('discord.js');
const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const BotException = require('../../exceptions/BotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');
const DateUtils = require('../../support/DateUtils');

class UserBotController extends BotController {
    async userinfo(){
        let member;
        if ( this._message.mentions.members.size === 0 ){
            member = this._message.member;
        }else{
            member = Object.values(this._message.mentions.members)[0];
        }
        let avatarURL = member.user.defaultAvatarURL;
        if ( member.user.avatar !== null ){
            avatarURL = UserBotController.AVATAR_URL_TEMPLATE.replace('{ID}', member.user.id).replace('{AVATAR}', member.user.avatar);
        }
        const roles = member.roles.cache.map(role => role.name);
        const messageEmbed = new MessageEmbed();
        messageEmbed.setTitle(member.user.tag);
        messageEmbed.setDescription(LocaleManager.getLabel('user.userinfo.description', this._locale));
        messageEmbed.addField(LocaleManager.getLabel('user.userinfo.id', this._locale), "```" + member.user.id + "```", true);
        messageEmbed.addField(LocaleManager.getLabel('user.userinfo.infoBot', this._locale), member.user.bot ? "```Yes```" : "```No```", true);
        messageEmbed.addField(LocaleManager.getLabel('user.userinfo.accountCreatedAt', this._locale), "```" + DateUtils.stringifyDate(member.user.createdAt, this._locale) + "```", false);
        messageEmbed.addField(LocaleManager.getLabel('user.userinfo.joinedAt', this._locale), "```" + DateUtils.stringifyDate(member.joinedAt, this._locale) + "```", false);
        messageEmbed.addField(LocaleManager.getLabel('user.userinfo.roles', this._locale), "```" + roles.join('\r') + "```", false);
        messageEmbed.setImage(avatarURL);
        await this._message.channel.send(messageEmbed);
    }
}

Object.defineProperty(UserBotController, 'AVATAR_URL_TEMPLATE', {
    value: 'https://cdn.discordapp.com/avatars/{ID}/{AVATAR}.jpg?size=512',
    writable: false
});

module.exports = UserBotController;
