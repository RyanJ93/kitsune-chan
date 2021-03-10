'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class GuildConfig extends Model {
    _guildID = null;
    _prefix = '?';

    static async find(guildID){
        let guildConfig = null;
        const properties = await Database.getConnection().collection('guilds').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            guildConfig = new GuildConfig();
            guildConfig.setProperties(properties);
        }
        return guildConfig;
    }

    constructor(guildID){
        super();

        this.setGuildID(guildID);
    }

    setGuildID(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        this._guildID = guildID;
        return this;
    }

    getGuildID(){
        return this._guildID;
    }

    setPrefix(prefix){
        if ( prefix === '' || typeof prefix !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid prefix.', 1);
        }
        this._prefix = prefix;
        return this;
    }

    getPrefix(){
        return this._prefix;
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
        await Database.getConnection().collection('guilds').updateOne({
            guildID: this._guildID
        }, {
            $set: {
                prefix: this._prefix
            }
        }, {
            upsert: true
        });
    }

    async delete(){
        await Database.getConnection().collection('guilds').deleteOne({
            guildID: this._guildID
        });
    }
}

module.exports = GuildConfig;
