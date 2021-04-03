'use strict';

const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const BotException = require('../../exceptions/BotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');
const { MessageEmbed } = require('discord.js');

class UserBotController extends BotController {
    async userinfo(){
        //const user = this._message.mentions.membesr.size == 0?
        let user;
        if ( this._message.mentions.members.size === 0 ) {
            user = this._message.author;
        } else {
            user = Object.values(this._message.mentions.members)[0].user;
        }
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

         var embed = new MessageEmbed()
        .setTitle(user.tag)
        .setDescription("Tutte le info di questo utente")
        .setThumbnail(user.avatarURL())
        .addField("User id", "```" + user.id + "```", true)
        .addField("Is a bot?", user.bot ? "```Yes```" : "```No```", true)
        .addField("Account created", "```" + user.createdAt.toDateString() + "```", true)
        //.addField("Joined this server", "```" + user.joinedAt.toDateString() + "```", true)
        .addField("Permissions", "```" + elencoPermessi + "```", false)
        //.addField("Roles", "```" + user.roles.cache.map(ruolo => ruolo.name).join("\r") + "```", false)

        await this._message.channel.send(embed);
    }
}

module.exports = UserBotController;
