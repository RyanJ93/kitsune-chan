'use strict';

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
        this._guildID = guildID;
        return this;
    }

    getGuildID(){
        return this._guildID;
    }

    setPrefix(prefix){
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
}

module.exports = GuildConfig;
