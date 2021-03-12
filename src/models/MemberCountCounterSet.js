'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class MemberCountCounterSet extends Model {
    #guildID = null;
    #userCount = 0;
    #channelCount = 0;
    #botCount = 0;
    #userCounterName = MemberCountCounterSet.DEFAULT_USER_COUNTER_NAME;
    #channelCounterName = MemberCountCounterSet.DEFAULT_CHANNEL_COUNTER_NAME;
    #botCounterName = MemberCountCounterSet.DEFAULT_BOT_COUNTER_NAME;
    #userCounterEnabled = false;
    #channelCounterEnabled = false;
    #botCounterEnabled = false;

    static async find(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        let memberCountCounterSet = null;
        const properties = await Database.getConnection().collection('memberCountCounterSet').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            memberCountCounterSet = new MemberCountCounterSet(guildID);
            memberCountCounterSet.setProperties(properties);
        }
        return memberCountCounterSet;
    }

    static async findOrNew(guildID, save = false){
        let memberCountCounterSet = await MemberCountCounterSet.find(guildID);
        if ( memberCountCounterSet === null ){
            memberCountCounterSet = new MemberCountCounterSet(guildID);
            if ( save === true ){
                await memberCountCounterSet.save();
            }
        }
        return memberCountCounterSet;
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

    setUserCount(userCount){
        if ( userCount === null || isNaN(userCount) || userCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#userCount = Math.floor(userCount);
        return this;
    }

    getUserCount(){
        return this.#userCount;
    }

    setChannelCount(channelCount){
        if ( channelCount === null || isNaN(channelCount) || channelCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#channelCount = Math.floor(channelCount);
        return this;
    }

    getChannelCount(){
        return this.#channelCount;
    }

    setBotCount(botCount){
        if ( botCount === null || isNaN(botCount) || botCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#botCount = Math.floor(botCount);
        return this;
    }

    getBotCount(){
        return this.#botCount;
    }

    setUserCounterName(userCounterName){
        if ( userCounterName === '' || typeof userCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#userCounterName = userCounterName;
        return this;
    }

    getUserCounterName(){
        return this.#userCounterName;
    }

    setChannelCounterName(channelCounterName){
        if ( channelCounterName === '' || typeof channelCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#channelCounterName = channelCounterName;
        return this;
    }

    getChannelCounterName(){
        return this.#channelCounterName;
    }

    setBotCounterName(botCounterName){
        if ( botCounterName === '' || typeof botCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#botCounterName = botCounterName;
        return this;
    }

    getBotCounterName(){
        return this.#botCounterName;
    }

    setUserCounterEnabled(userCounterEnabled){
        this.#userCounterEnabled = userCounterEnabled === true;
        return this;
    }

    getUserCounterEnabled(){
        return this.#userCounterEnabled;
    }

    setChannelCounterEnabled(channelCounterEnabled){
        this.#channelCounterEnabled = channelCounterEnabled === true;
        return this;
    }

    getChannelCounterEnabled(){
        return this.#userCounterEnabled;
    }

    setBotCounterEnabled(botCounterEnabled){
        this.#botCounterEnabled = botCounterEnabled === true;
        return this;
    }

    getBotCounterEnabled(){
        return this.#botCounterEnabled;
    }

    setProperties(properties){
        if ( properties.hasOwnProperty('guildID') ){
            this.setGuildID(properties.guildID);
        }
        if ( properties.hasOwnProperty('userCount') ){
            this.setUserCount(properties.userCount);
        }
        if ( properties.hasOwnProperty('channelCount') ){
            this.setChannelCount(properties.channelCount);
        }
        if ( properties.hasOwnProperty('botCount') ){
            this.setBotCount(properties.botCount);
        }
        if ( properties.hasOwnProperty('userCounterName') ){
            this.setUserCounterName(properties.userCounterName);
        }
        if ( properties.hasOwnProperty('channelCounterName') ){
            this.setChannelCounterName(properties.channelCounterName);
        }
        if ( properties.hasOwnProperty('botCounterName') ){
            this.setBotCounterName(properties.botCounterName);
        }
        if ( properties.hasOwnProperty('userCounterEnabled') ){
            this.setUserCounterEnabled(properties.userCounterEnabled);
        }
        if ( properties.hasOwnProperty('channelCounterEnabled') ){
            this.setChannelCounterEnabled(properties.channelCounterEnabled);
        }
        if ( properties.hasOwnProperty('botCounterEnabled') ){
            this.setBotCounterEnabled(properties.botCounterEnabled);
        }
        return this;
    }

    async save(){
        await Database.getConnection().collection('memberCountCounterSet').updateOne({
            guildID: this.#guildID
        }, {
            $set: {
                userCount: this.#userCount,
                channelCount: this.#channelCount,
                botCount: this.#botCount,
                userCounterName: this.#userCounterName,
                channelCounterName: this.#channelCounterName,
                botCounterName: this.#botCounterName,
                userCounterEnabled: this.#userCounterEnabled,
                channelCounterEnabled: this.#channelCounterEnabled,
                botCounterEnabled: this.#botCounterEnabled
            }
        }, {
            upsert: true
        });
    }

    async delete(){
        await Database.getConnection().collection('memberCountCounterSet').deleteOne({
            guildID: this.#guildID
        });
    }
}

Object.defineProperty(MemberCountCounterSet, 'DEFAULT_USER_COUNTER_NAME', {
    value: 'Member count',
    writable: false
});

Object.defineProperty(MemberCountCounterSet, 'DEFAULT_CHANNEL_COUNTER_NAME', {
    value: 'Channel count',
    writable: false
});

Object.defineProperty(MemberCountCounterSet, 'DEFAULT_BOT_COUNTER_NAME', {
    value: 'Bot count',
    writable: false
});

module.exports = MemberCountCounterSet;
