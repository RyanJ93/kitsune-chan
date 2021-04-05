'use strict';

const { MessageEmbed } = require('discord.js');
const BotController = require('./BotController');
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
        const labels = LocaleManager.getLabelMulti([
            'user.userinfo.description',
            'user.userinfo.userID',
            'user.userinfo.infoBot',
            'common.yes',
            'common.no',
            'user.userinfo.accountCreatedAt',
            'user.userinfo.joinedAt',
            'user.userinfo.roles'
        ], this._locale);
        const accountCreatedAt = DateUtils.stringifyDate(member.user.createdAt, this._locale);
        const joinedAt = DateUtils.stringifyDate(member.joinedAt, this._locale);
        const isBot = member.user.bot ? labels['common.yes'] : labels['common.no'];
        messageEmbed.setDescription(labels['user.userinfo.description']);
        messageEmbed.addField(labels['user.userinfo.userID'], "```" + member.user.id + "```", true);
        messageEmbed.addField(labels['user.userinfo.infoBot'], "```" + isBot + "```", true);
        messageEmbed.addField(labels['user.userinfo.accountCreatedAt'], "```" + accountCreatedAt + "```", false);
        messageEmbed.addField(labels['user.userinfo.joinedAt'], "```" + joinedAt + "```", false);
        messageEmbed.addField(labels['user.userinfo.roles'], "```" + roles.join('\r') + "```", false);
        messageEmbed.setImage(avatarURL);
        await this._message.channel.send(messageEmbed);
    }
}

Object.defineProperty(UserBotController, 'AVATAR_URL_TEMPLATE', {
    value: 'https://cdn.discordapp.com/avatars/{ID}/{AVATAR}.jpg?size=512',
    writable: false
});

module.exports = UserBotController;
