'use strict';

const lala = require('@lala.js/core');
const { Guild, Channel } = require('discord.js');
const ChatConfig = require('../models/ChatConfig');

class ChatService extends lala.Service {
    /**
     * @type {?module:"discord.js".Guild}
     */
    #guild = null;

    /**
     * @type {?ChatConfig}
     */
    #chatConfig = null;

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
     */
    constructor(guild){
        super();

        this.setGuild(guild);
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
}

module.exports = ChatService;
