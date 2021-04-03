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
        var elencoPermessi = "";
        /*if (user.hasPermission("ADMINISTRATOR")) {
            elencoPermessi = "👑 ADMINISTRATOR";
        }
        else {
            var permessi = ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "MANAGE_CHANNELS", "MANAGE_GUILD", "ADD_REACTIONS", "VIEW_AUDIT_LOG", "PRIORITY_SPEAKER", "STREAM", "VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "VIEW_GUILD_INSIGHTS", "CONNECT", "SPEAK", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS"]

            for (var i = 0; i < permessi.length; i++) {
                if (user.hasPermission(permessi[i])) {
                    elencoPermessi += "- " + permessi[i] + "\r";
                }
            }
        }*/
        const messageEmbed = new MessageEmbed(); // per convenzione chiamiano le instaze degli oggetti con il nome della classe con l'iniziale minuscola.
        messageEmbed.setTitle(member.user.tag);
        messageEmbed.setDescription("Tutte le info di questo utente"); // la label è da tradurre.
        //messageEmbed.setThumbnail(avatarURL);
        // Da tradurre anche le label sottostanti
        messageEmbed.addField("User id", "```" + member.user.id + "```", true);
        messageEmbed.addField("Is a bot?", member.user.bot ? "```Yes```" : "```No```", true);
        // usiamo "stringifyDate" che usa il metodo "toLocaleDateString" di js per visualizzare la data in lingua.
        messageEmbed.addField("Account created", "```" + DateUtils.stringifyDate(member.user.createdAt, this._locale) + "```", false);
        messageEmbed.addField("Joined this server", "```" + DateUtils.stringifyDate(member.joinedAt, this._locale) + "```", false);
        messageEmbed.addField("Permissions", "```" + elencoPermessi + "```", false);
        messageEmbed.addField("Roles", "```" + roles.join('\r') + "```", false);
        messageEmbed.setImage(avatarURL);
        await this._message.channel.send(messageEmbed);
    }
}

Object.defineProperty(UserBotController, 'AVATAR_URL_TEMPLATE', {
    value: 'https://cdn.discordapp.com/avatars/{ID}/{AVATAR}.jpg?size=512',
    writable: false
});

module.exports = UserBotController;
