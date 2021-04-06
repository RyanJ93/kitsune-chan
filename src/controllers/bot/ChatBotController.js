'use strict';

const path = require('path');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const BotException = require('../../exceptions/BotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');
const MemberCountCounterSet = require('../../models/MemberCountCounterSet');
const GuildConfig = require('../../models/GuildConfig');

class ChatBotController extends BotController {
    async say(){
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            await this._message.channel.send(this._message.cleanedContent);
        }
    }

    async help(){
        let message;
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            if ( !CommandRouter.commandExists(this._message.cleanedContent) ){
                throw new BotException(LocaleManager.getLabel('chat.help.commandNotFound', this._locale), 1);
            }
            message = HelpService.getHelpMessageContent(this._message.cleanedContent, this._locale);
        }else{
            message = HelpService.getHelpMessageContent(this._locale);
        }
        if ( message !== '' ){
            await this._message.channel.send(message);
        }
    }

    async info(){
        const [ entityCounters, guildCount ] = await Promise.all([
            MemberCountCounterSet.getGlobalCounters(),
            GuildConfig.count()
        ]);
        const labels = LocaleManager.getLabelMulti([
            'chat.info.description',
            'chat.info.creator',
            'chat.info.version',
            'chat.info.uptime',
            'chat.info.users',
            'chat.info.channels',
            'chat.info.server',
            'chat.info.techs',
            'chat.info.techsText'
        ], this._locale);
        const messageEmbed = new MessageEmbed();
        messageEmbed.setTitle('Kitsune-chan');
        messageEmbed.setDescription(labels['chat.info.description']);
        messageEmbed.setThumbnail('attachment://icon.png');
        messageEmbed.addField(labels['chat.info.creator'], 'RyanJ93#7201', true);
        // TODO: Add dynamic version and uptime once upgraded to Lala 0.2.0
        messageEmbed.addField(labels['chat.info.version'], '0.0.1', true);
        messageEmbed.addField(labels['chat.info.uptime'], '-', true);
        messageEmbed.addField(labels['chat.info.users'], entityCounters.users, true);
        messageEmbed.addField(labels['chat.info.channels'], entityCounters.channels, true);
        messageEmbed.addField(labels['chat.info.server'], guildCount, true);
        messageEmbed.addField(labels['chat.info.techs'], labels['chat.info.techsText']);
        const iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'icon.png');
        messageEmbed.attachFiles([new MessageAttachment(iconPath, 'icon.png')]);
        await this._message.channel.send(messageEmbed);
    }
}

module.exports = ChatBotController;
