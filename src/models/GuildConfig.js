'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class GuildConfig extends Model {
    #guildID = null;
    #prefix = GuildConfig.DEFAULT_PREFIX;

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

    static count(){
        return Database.getConnection().collection('guildsConfig').countDocuments();
    }

    constructor(guildID){
        super();

        this.setGuildID(guildID);
    }

    setGuildID(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        this.#guildID = guildID;
        return this;
    }

    getGuildID(){
        return this.#guildID;
    }

    setPrefix(prefix){
        if ( prefix === '' || typeof prefix !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid prefix.', 1);
        }
        this.#prefix = prefix;
        return this;
    }

    getPrefix(){
        return this.#prefix;
    }

    setProperties(properties){
        if ( properties.hasOwnProperty('guildID') ){
            this.setGuildID(properties.guildID);
        }
        if ( properties.hasOwnProperty('prefix') ){
            this.setPrefix(properties.prefix);
        }
        return this;
    }

    async save(){
        await Database.getConnection().collection('guildsConfig').updateOne({
            guildID: this.#guildID
        }, {
            $set: {
                prefix: this.#prefix
            }
        }, {
            upsert: true
        });
    }

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
