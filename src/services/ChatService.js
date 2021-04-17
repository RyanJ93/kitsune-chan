'use strict';

const lala = require('@lala.js/core');
const { Guild, Channel, DiscordAPIError, TextChannel } = require('discord.js');
const ChatConfig = require('../models/ChatConfig');
const GuildConfig = require('../models/GuildConfig');
const CommandRouter = require('../CommandRouter');

/**
 * @typedef {Object} ClientServiceUserProperties
 *
 * @property {?string} [username]
 * @property {?string} [avatar]
 * @property {?string} [userID]
 * @property {?string} [avatarID]
 */

class ChatService extends lala.Service {
    /**
     *
     * @param {module:"discord.js".Message} message
     * @param {boolean} [animatedOnly=false]
     *
     * @returns {Promise<string[]>}
     */
    static async extractEmojisFromMessage(message, animatedOnly = false){
        const emojiIdentifierList = message.content.match(/<:[a-zA-Z0-9_]+:[0-9]+>/g);
        const processes = [], index = new Set();
        if ( emojiIdentifierList !== null ){
            emojiIdentifierList.forEach((emojiIdentifier) => {
                const delimiterIndex = emojiIdentifier.lastIndexOf(':');
                const emojiID = emojiIdentifier.substring(delimiterIndex + 1, emojiIdentifier.length - 1);
                if ( !index.has(emojiID) ){
                    processes.push(message.guild.emojis.resolve(emojiID));
                    index.add(emojiID);
                }
            });
        }
        let emojis = processes.length === 0 ? [] : await Promise.all(processes);
        if ( emojis.length > 0 && animatedOnly === true ){
            emojis = emojis.filter((emoji) => emoji !== null && emoji.animated);
        }
        return emojis;
    }

    /**
     *
     * @param {module:"discord.js".Message} message
     * @param {boolean} [animatedOnly=false]
     *
     * @returns {Promise<string[]>}
     */
    static #extractEmojisFromPlaceholders(message, animatedOnly = false){
        const emojiIdentifierList = message.content.match(/:[a-zA-Z0-9_]+:/g);
        const index = new Set(), emojis = new Map();
        if ( emojiIdentifierList !== null ){
            emojiIdentifierList.forEach((emojiIdentifier) => {
                if ( emojiIdentifier.charAt(0) !== '<' ){
                    const emojiName = emojiIdentifier.substring(1, emojiIdentifier.length - 1);
                    if ( !index.has(emojiName) ){
                        index.add(emojiName);
                        const emoji = message.guild.emojis.cache.find((emoji) => emoji.name === emojiName);
                        if ( typeof emoji !== 'undefined' && ( animatedOnly !== true || emoji.animated ) ){
                            emojis.set(':' + emoji.name + ':', emoji);
                        }
                    }
                }
            });
        }
        return emojis;
    }

    /**
     *
     * @param {module:"discord.js".Message} message
     *
     * @returns {Promise<void>}
     */
    static async #handleIncomingMessage(message){
        if ( !message.author.bot ){
            const guildConfig = await GuildConfig.find(message.guild.id);
            if ( CommandRouter.getCommandDataFromMessage(message, guildConfig.getPrefix()) === null ){
                const chatConfig = await ChatConfig.findOrNew(message.guild.id);
                if ( chatConfig.getAnimatedEmojiEnabled() ){
                    const emojis = await ChatService.extractEmojisFromMessage(message, true);
                    if ( emojis.length === 0 ){
                        const emojisToConvert = ChatService.#extractEmojisFromPlaceholders(message, true);
                        if ( emojisToConvert.size > 0 ){
                            const chatService = new ChatService(message.guild, message.channel);
                            await message.delete();
                            const text = message.content.replace(/:[a-zA-Z0-9_]+:/g, (occurrence) => {
                                return emojisToConvert.has(occurrence) ? emojisToConvert.get(occurrence) : occurrence;
                            });
                            await chatService.sendMessageAsUser(text, message.member);
                        }
                    }
                }
            }
        }
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     */
    static installMiddleware(client){
        client.on('message', async (message) => {
            await ChatService.#handleIncomingMessage(message);
        });
    }

    /**
     *
     * @param {module:"discord.js".Message} message
     *
     * @returns {Promise<?module:"discord.js".Message>}
     */
    static async getReferencedMessage(message){
        let referencedMessage = null;
        if ( message.reference !== null ){
            try{
                referencedMessage = await message.channel.messages.fetch(message.reference.messageID);
            }catch(ex){
                if ( !( ex instanceof DiscordAPIError ) || ex.code !== 10008 ){
                    throw ex;
                }
            }
        }
        return referencedMessage;
    }

    /**
     *
     * @param {module:"discord.js".Message} message
     *
     * @returns {Promise<?module:"discord.js".Message>}
     */
    static async getPreviousMessage(message){
        let previousMessage = null;
        const olderMessages = await message.channel.messages.fetch({
            limit: 1,
            before: message.id
        });
        if ( olderMessages.size > 0 ){
            previousMessage = Array.from(olderMessages.values())[0];
        }
        return previousMessage;
    }

    /**
     *
     * @param {string} messageContent
     *
     * @returns {string[]}
     */
    static extractEmojiNamesFromMessageContent(messageContent){
        const emojiNames = messageContent.match(/<:[a-zA-Z0-9_]+:[0-9]+>|:[a-zA-Z0-9_]+:/g);
        return emojiNames === null ? [] : emojiNames.map((emojiName) => {
            let processedName;
            if ( emojiName.charAt(0) === '<' ){
                processedName = emojiName.substring(2, emojiName.lastIndexOf(':'));
            }else{
                processedName = emojiName.substring(1, emojiName.length - 1);
            }
            return processedName;
        });
    }

    /**
     * @type {?module:"discord.js".Guild}
     */
    #guild = null;

    /**
     * @type {?ChatConfig}
     */
    #chatConfig = null;

    /**
     * @type {?module:"discord.js".TextChannel}
     */
    #channel = null;

    /**
     *
     * @param {string} message
     * @param {number} delay
     * @param {boolean} isTyping
     * @param {module:"discord.js".Channel} channel
     *
     * @returns {Promise<module:"discord.js".Message>}
     */
    #sendWithDelay(message, delay, isTyping, channel){
        return new Promise((resolve, reject) => {
            if ( isTyping === true ){
                channel.startTyping();
            }
            setTimeout(() => {
                channel.send(message).then((message) => {
                    if ( isTyping === true ){
                        channel.stopTyping();
                    }
                    resolve(message);
                }).catch((ex) => {
                    if ( isTyping === true ){
                        channel.stopTyping();
                    }
                    reject(ex);
                });
            }, delay);
        });
    }

    /**
     *
     * @param {module:"discord.js".Guild} guild
     * @param {module:"discord.js".TextChannel} channel
     */
    constructor(guild, channel = null){
        super();

        this.setGuild(guild).setChannel(channel);
    }

    /**
     *
     * @param {module:"discord.js".Guild} guild
     *
     * @returns {ChatService}
     */
    setGuild(guild){
        if ( !( guild instanceof Guild ) ){
            throw new lala.InvalidArgumentException('Invalid guild.', 1);
        }
        this.#guild = guild;
        return this;
    }

    /**
     *
     * @returns {module:"discord.js".Guild}
     */
    getGuild(){
        return this.#guild;
    }

    /**
     *
     * @param {module:"discord.js".TextChannel} channel
     *
     * @returns {ChatService}
     */
    setChannel(channel){
        if ( channel !== null && !( channel instanceof TextChannel ) ){
            throw new lala.InvalidArgumentException('Invalid channel.', 1);
        }
        this.#channel = channel;
        return this;
    }

    /**
     *
     * @returns {?module:"discord.js".TextChannel}
     */
    getChannel(){
        return this.#channel;
    }

    /**
     *
     * @param {?module:"discord.js".Channel} fallbackChannel
     *
     * @returns {Promise<module:"discord.js".Channel>}
     */
    async getTargetChannel(fallbackChannel = null){
        if ( fallbackChannel !== null && !( fallbackChannel instanceof Channel ) ){
            throw new lala.InvalidArgumentException('Invalid fallback channel.', 1);
        }
        if ( this.#chatConfig === null ){
            this.#chatConfig = await ChatConfig.findOrNew(this.#guild.id);
        }
        let channel = fallbackChannel;
        if ( this.#chatConfig.getTargetChannelID() !== null ){
            channel = await this.#guild.channels.resolve(this.#chatConfig.getTargetChannelID());
            if ( channel === null || channel.type !== 'text' ){
                await this.#chatConfig.setTargetChannelID(null).save();
                channel = fallbackChannel;
            }
        }
        return channel;
    }

    /**
     *
     * @param {string} message
     * @param {?module:"discord.js".Channel} fallbackChannel
     * @param {boolean} forceChannel
     *
     * @returns {Promise<void>}
     */
    async say(message, fallbackChannel = null, forceChannel = false){
        if ( typeof message !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid message.', 1);
        }
        if ( fallbackChannel !== null && !( fallbackChannel instanceof Channel ) ){
            throw new lala.InvalidArgumentException('Invalid fallback channel.', 2);
        }
        const channel = forceChannel === true ? fallbackChannel : await this.getTargetChannel(fallbackChannel);
        if ( channel === null ){
            throw new lala.RuntimeException('No available channel.', 3);
        }
        await channel.send(message);
    }

    /**
     *
     * @param {string} message
     * @param {?module:"discord.js".Channel} fallbackChannel
     * @param {boolean} forceChannel
     * @param {number} delay
     *
     * @returns {Promise<void>}
     */
    async type(message, fallbackChannel = null, forceChannel = false, delay = 2000){
        if ( typeof message !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid message.', 1);
        }
        if ( fallbackChannel !== null && !( fallbackChannel instanceof Channel ) ){
            throw new lala.InvalidArgumentException('Invalid fallback channel.', 2);
        }
        if ( delay === null || isNaN(delay) || delay < 0 ){
            throw new lala.InvalidArgumentException('Invalid delay value.', 3);
        }
        const channel = forceChannel === true ? fallbackChannel : await this.getTargetChannel(fallbackChannel);
        if ( channel === null ){
            throw new lala.RuntimeException('No available channel.', 4);
        }
        await this.#sendWithDelay(message, delay, true, channel);
    }

    /**
     *
     * @param {string} message
     * @param {string[]} emojiNames
     *
     * @returns {Promise<void>}
     */
    async reactWithEmojis(message, emojiNames){
        const emojiObjects = new Map(), index = new Set(), processes = [];
        emojiNames.forEach((emojiName) => {
            if ( !index.has(emojiName) ){
                const emoji = this.#guild.emojis.cache.find((emoji) => emoji.name === emojiName);
                if ( typeof emoji !== 'undefined' ){
                    emojiObjects.set(emojiName, emoji);
                }
                index.add(emojiName);
            }
        });
        for ( const [emojiName, emoji] of emojiObjects ){
            processes.push(message.react(emoji));
        }
        await Promise.all(processes);
    }

    /**
     *
     * @param {string} message
     * @param {?ClientServiceUserProperties} userProps
     *
     * @returns {Promise<void>}
     */
    async sendMessageAsVirtualUser(message, userProps){
        let avatar = 'https://cdn.discordapp.com/avatars/' + this.#guild.me.id + '/' + this.#guild.me.user.avatar + '.jpg';
        let username = this.#guild.me.displayName;
        if ( userProps !== null && typeof userProps === 'object' ){
            if ( userProps.username !== '' && typeof userProps.username === 'string' ){
                username = userProps.username;
            }
            if ( userProps.avatar !== '' && typeof userProps.avatar === 'string' ){
                avatar = userProps.avatar;
            }
            if ( userProps.userID !== '' && typeof userProps.userID === 'string' && userProps.avatarID !== '' && typeof userProps.avatarID === 'string' ){
                avatar = 'https://cdn.discordapp.com/avatars/' + userProps.userID + '/' + userProps.avatarID + '.jpg';
            }
        }
        const webhook = await this.#channel.createWebhook(username, {
            avatar: avatar
        });
        await webhook.send(message);
        await webhook.delete();
    }

    /**
     *
     * @param {string} message
     * @param user
     * @returns {Promise<void>}
     */
    sendMessageAsUser(message, user){
        return this.sendMessageAsVirtualUser(message, {
            username: user.displayName,
            userID: user.id,
            avatarID: user.user.avatar,
        });
    }
}

module.exports = ChatService;
