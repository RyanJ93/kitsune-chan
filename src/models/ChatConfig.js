'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

/**
 * @typedef {Object} ChatConfigProperties
 *
 * @property {string} guildID
 * @property {?string} targetChannelID
 */

class ChatConfig extends Model {
    /**
     *
     * @param {string} guildID
     *
     * @returns {Promise<?ChatConfig>}
     */
    static async find(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        let chatConfig = null;
        const properties = await Database.getConnection().collection('chatConfig').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            chatConfig = new ChatConfig(guildID);
            chatConfig.setProperties(properties);
        }
        return chatConfig;
    }

    /**
     *
     * @param {string} guildID
     * @param {boolean} save
     *
     * @returns {Promise<ChatConfig>}
     */
    static async findOrNew(guildID, save = false){
        let chatConfig = await ChatConfig.find(guildID);
        if ( chatConfig === null ){
            chatConfig = new ChatConfig(guildID);
            if ( save === true ){
                await chatConfig.save();
            }
        }
        return chatConfig;
    }

    /**
     * @type {?string}
     */
    #guildID = null;

    /**
     * @type {?string}
     */
    #targetChannelID = null;

    /**
     * @type {boolean}
     */
    #animatedEmojiEnabled = true;

    /**
     * @param {string} guildID
     */
    constructor(guildID){
        super();

        this.setGuildID(guildID);
    }

    /**
     *
     * @param {string} guildID
     *
     * @returns {ChatConfig}
     */
    setGuildID(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        this.#guildID = guildID;
        return this;
    }

    /**
     *
     * @returns {string}
     */
    getGuildID(){
        return this.#guildID;
    }

    /**
     *
     * @param {string} targetChannelID
     *
     * @returns {ChatConfig}
     */
    setTargetChannelID(targetChannelID){
        if ( targetChannelID !== null && typeof targetChannelID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid target channel ID.', 1);
        }
        this.#targetChannelID = targetChannelID === '' ? null : targetChannelID;
        return this;
    }

    /**
     *
     * @returns {?string}
     */
    getTargetChannelID(){
        return this.#targetChannelID;
    }

    /**
     *
     * @param {boolean} animatedEmojiEnabled
     *
     * @returns {ChatConfig}
     */
    setAnimatedEmojiEnabled(animatedEmojiEnabled){
        this.#animatedEmojiEnabled = animatedEmojiEnabled !== false;
        return this;
    }

    /**
     *
     * @returns {boolean}
     */
    getAnimatedEmojiEnabled(){
        return this.#animatedEmojiEnabled;
    }

    /**
     *
     * @returns {ChatConfigProperties}
     */
    getProperties(){
        return {
            guildID: this.#guildID,
            targetChannelID: this.#targetChannelID,
            animatedEmojiEnabled: this.#animatedEmojiEnabled
        };
    }

    /**
     *
     * @param {ChatConfigProperties} properties
     *
     * @returns {ChatConfig}
     */
    setProperties(properties){
        if ( properties.hasOwnProperty('guildID') ){
            this.setGuildID(properties.guildID);
        }
        if ( properties.hasOwnProperty('targetChannelID') ){
            this.setTargetChannelID(properties.targetChannelID);
        }
        if ( properties.hasOwnProperty('animatedEmojiEnabled') ){
            this.setAnimatedEmojiEnabled(properties.animatedEmojiEnabled);
        }
        return this;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async save(){
        const properties = this.getProperties();
        delete properties.guildID;
        await Database.getConnection().collection('chatConfig').updateOne({
            guildID: this.#guildID
        }, { $set: properties }, { upsert: true });
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async delete(){
        await Database.getConnection().collection('chatConfig').deleteOne({
            guildID: this.#guildID
        });
    }
}

module.exports = ChatConfig;
