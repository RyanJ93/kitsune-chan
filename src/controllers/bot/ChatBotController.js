'use strict';

const path = require('path');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const BotController = require('./BotController');
const HelpService = require('../../services/HelpService');
const UsageBotException = require('../../exceptions/UsageBotException');
const CommandRouter = require('../../CommandRouter');
const LocaleManager = require('../../support/LocaleManager');
const MemberCountCounterSet = require('../../models/MemberCountCounterSet');
const GuildConfig = require('../../models/GuildConfig');
const ChatConfig = require('../../models/ChatConfig');
const ChatService = require('../../services/ChatService');

class ChatBotController extends BotController {
    async say(){
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            const chatService = new ChatService(this._guild);
            await chatService.say(this._message.cleanedContent, this._message.channel);
        }
    }

    async type(){
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            const chatService = new ChatService(this._guild);
            await chatService.type(this._message.cleanedContent, this._message.channel);
        }
    }

    async target(){
        const channelID = this._message.cleanedContent.substr(2, this._message.cleanedContent.length - 3);
        if ( channelID === '' ){
            throw new UsageBotException(LocaleManager.getLabel('chat.target.invalidChannel', this._locale), 1);
        }
        const channel = await this._guild.channels.resolve(channelID);
        if ( channel === null ){
            throw new UsageBotException(LocaleManager.getLabel('chat.target.undefinedChannel', this._locale), 2);
        }else if ( channel.type !== 'text' ){
            throw new UsageBotException(LocaleManager.getLabel('chat.target.invalidTextChannel', this._locale), 3);
        }
        const chatConfig = await ChatConfig.findOrNew(this._guild.id);
        await chatConfig.setTargetChannelID(channelID).save();
        await this._reply(LocaleManager.getLabel('chat.target.channelSet', this._locale));
    }

    async help(){
        let message;
        if ( this._message.cleanedContent !== '' && typeof this._message.cleanedContent === 'string' ){
            if ( !CommandRouter.commandExists(this._message.cleanedContent) ){
                throw new UsageBotException(LocaleManager.getLabel('chat.help.commandNotFound', this._locale), 1);
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
            'chat.info.techsText'
        ], this._locale);
        const messageEmbed = new MessageEmbed();
        messageEmbed.setTitle('Kitsune-chan');
        messageEmbed.setDescription(labels['chat.info.description']);
        messageEmbed.setThumbnail('attachment://icon.jpg');
        messageEmbed.addField(labels['chat.info.creator'], 'RyanJ93#7201', true);
        // TODO: Add dynamic version and uptime once upgraded to Lala 0.2.0
        messageEmbed.addField(labels['chat.info.version'], '0.0.1', true);
        messageEmbed.addField(labels['chat.info.uptime'], '-', true);
        messageEmbed.addField(labels['chat.info.users'], entityCounters.users, true);
        messageEmbed.addField(labels['chat.info.channels'], entityCounters.channels, true);
        messageEmbed.addField(labels['chat.info.server'], guildCount, true);
        messageEmbed.setFooter(labels['chat.info.techsText']);
        const iconPath = path.join(__dirname, '..', '..', '..', 'assets', 'icon.jpg');
        messageEmbed.attachFiles([new MessageAttachment(iconPath, 'icon.jpg')]);
        await this._message.channel.send(messageEmbed);
    }

    async animatedEmoji(){
        const operation = this._message.cleanedContent.trim();
        const enabled = operation === 'on' ? true : ( operation === 'off' ? false : null );
        if ( enabled === null ){
            throw new UsageBotException(LocaleManager.getLabel('chat.animatedEmoji.unsupportedOperation', this._locale), 1);
        }
        const chatConfig = await ChatConfig.findOrNew(this._guild.id);
        await chatConfig.setAnimatedEmojiEnabled(enabled).save();
        const responseLabelID = enabled ? 'chat.animatedEmoji.enabled' : 'chat.animatedEmoji.disabled';
        await this._reply(LocaleManager.getLabel(responseLabelID, this._locale));
    }

    async emojiReact(){
        const emojiNames = ChatService.extractEmojiNamesFromMessageContent(this._message.cleanedContent);
        if ( emojiNames.length > 0 ){
            const chatService = new ChatService(this._guild);
            let targetMessage;
            if ( this._message.reference === null ){
                targetMessage = await ChatService.getPreviousMessage(this._message);
            }else{
                targetMessage = await ChatService.getReferencedMessage(this._message);
            }
            if ( targetMessage !== null ){
                await chatService.reactWithEmojis(targetMessage, emojiNames);
            }
            await this._message.delete();
        }
    }
}

module.exports = ChatBotController;
