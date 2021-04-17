'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

/**
 * @typedef {Object} GuildConfigProperties
 *
 * @property {string} guildID
 * @property {string} prefix
 */

class GuildConfig extends Model {
    /**
     *
     * @param {string} guildID
     *
     * @return {Promise<?GuildConfig>}
     */
    static async find(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        let guildConfig = null;
        const properties = await Database.getConnection().collection('guildsConfig').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            guildConfig = new GuildConfig(guildID);
            guildConfig.setProperties(properties);
        }
        return guildConfig;
    }

    /**
     *
     * @param {string} guildID
     * @param {boolean} save
     *
     * @return {Promise<GuildConfig>}
     */
    static async findOrNew(guildID, save = false){
        let guildConfig = await GuildConfig.find(guildID);
        if ( guildConfig === null ){
            guildConfig = new GuildConfig(guildID);
            if ( save === true ){
                await guildConfig.save();
            }
        }
        return guildConfig;
    }

    /**
     *
     * @return {Promise<number>}
     */
    static count(){
        return Database.getConnection().collection('guildsConfig').countDocuments();
    }

    /**
     * @type {?string}
     */
    #guildID = null;

    /**
     * @type {string}
     */
    #prefix = GuildConfig.DEFAULT_PREFIX;

    /**
     *
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
     * @returns {GuildConfig}
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
     * @param {string} prefix
     *
     * @return {GuildConfig}
     */
    setPrefix(prefix){
        if ( prefix === '' || typeof prefix !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid prefix.', 1);
        }
        this.#prefix = prefix;
        return this;
    }

    /**
     *
     * @return {string}
     */
    getPrefix(){
        return this.#prefix;
    }

    /**
     *
     * @returns {GuildConfigProperties}
     */
    getProperties(){
        return {
            guildID: this.#guildID,
            prefix: this.#prefix
        };
    }

    /**
     *
     * @param {GuildConfigProperties} properties
     *
     * @return {GuildConfig}
     */
    setProperties(properties){
        if ( properties.hasOwnProperty('guildID') ){
            this.setGuildID(properties.guildID);
        }
        if ( properties.hasOwnProperty('prefix') ){
            this.setPrefix(properties.prefix);
        }
        return this;
    }

    /**
     *
     * @return {Promise<void>}
     */
    async save(){
        const properties = this.getProperties();
        delete properties.guildID;
        await Database.getConnection().collection('guildsConfig').updateOne({
            guildID: this.#guildID
        }, { $set: properties }, { upsert: true });
    }

    /**
     *
     * @return {Promise<void>}
     */
    async delete(){
        await Database.getConnection().collection('guildsConfig').deleteOne({
            guildID: this.#guildID
        });
    }
}

Object.defineProperty(GuildConfig, 'DEFAULT_PREFIX', {
    value: '?',
    writable: false
});

module.exports = GuildConfig;
