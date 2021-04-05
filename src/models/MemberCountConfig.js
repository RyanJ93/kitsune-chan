'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class MemberCountConfig extends Model {
    #guildID = null;
    #memberCounterName = MemberCountConfig.DEFAULT_MEMBER_COUNTER_NAME;
    #userCounterName = MemberCountConfig.DEFAULT_USER_COUNTER_NAME;
    #textChannelCounterName = MemberCountConfig.DEFAULT_TEXT_CHANNEL_COUNTER_NAME;
    #voiceChannelCounterName = MemberCountConfig.DEFAULT_VOICE_CHANNEL_COUNTER_NAME;
    #channelCounterName = MemberCountConfig.DEFAULT_CHANNEL_COUNTER_NAME;
    #botCounterName = MemberCountConfig.DEFAULT_BOT_COUNTER_NAME;
    #memberCounterEnabled = false;
    #userCounterEnabled = false;
    #textChannelCounterEnabled = false;
    #voiceChannelCounterEnabled = false;
    #channelCounterEnabled = false;
    #botCounterEnabled = false;

    static async find(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        let memberCountConfig = null;
        const properties = await Database.getConnection().collection('memberCountConfig').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            memberCountConfig = new MemberCountConfig(guildID);
            memberCountConfig.setProperties(properties);
        }
        return memberCountConfig;
    }

    static async findOrNew(guildID, save = false){
        let memberCountConfig = await MemberCountConfig.find(guildID);
        if ( memberCountConfig === null ){
            memberCountConfig = new MemberCountConfig(guildID);
            if ( save === true ){
                await memberCountConfig.save();
            }
        }
        return memberCountConfig;
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

    setMemberCounterName(memberCounterName){
        if ( memberCounterName === '' || typeof memberCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#memberCounterName = memberCounterName;
        return this;
    }

    getMemberCounterName(){
        return this.#memberCounterName;
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

    setTextChannelCounterName(textChannelCounterName){
        if ( textChannelCounterName === '' || typeof textChannelCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#textChannelCounterName = textChannelCounterName;
        return this;
    }

    getTextChannelCounterName(){
        return this.#textChannelCounterName;
    }

    setVoiceChannelCounterName(voiceChannelCounterName){
        if ( voiceChannelCounterName === '' || typeof voiceChannelCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#voiceChannelCounterName = voiceChannelCounterName;
        return this;
    }

    getVoiceChannelCounterName(){
        return this.#voiceChannelCounterName;
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

    setMemberCounterEnabled(memberCounterEnabled){
        this.#memberCounterEnabled = memberCounterEnabled === true;
        return this;
    }

    getMemberCounterEnabled(){
        return this.#memberCounterEnabled;
    }

    setUserCounterEnabled(userCounterEnabled){
        this.#userCounterEnabled = userCounterEnabled === true;
        return this;
    }

    getUserCounterEnabled(){
        return this.#userCounterEnabled;
    }

    setTextChannelCounterEnabled(textChannelCounterEnabled){
        this.#textChannelCounterEnabled = textChannelCounterEnabled === true;
        return this;
    }

    getTextChannelCounterEnabled(){
        return this.#textChannelCounterEnabled;
    }

    setVoiceChannelCounterEnabled(voiceChannelCounterEnabled){
        this.#voiceChannelCounterEnabled = voiceChannelCounterEnabled === true;
        return this;
    }

    getVoiceChannelCounterEnabled(){
        return this.#voiceChannelCounterEnabled;
    }

    setChannelCounterEnabled(channelCounterEnabled){
        this.#channelCounterEnabled = channelCounterEnabled === true;
        return this;
    }

    getChannelCounterEnabled(){
        return this.#channelCounterEnabled;
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
        if ( properties.hasOwnProperty('memberCounterName') ){
            this.setMemberCounterName(properties.memberCounterName);
        }
        if ( properties.hasOwnProperty('userCounterName') ){
            this.setUserCounterName(properties.userCounterName);
        }
        if ( properties.hasOwnProperty('textChannelCounterName') ){
            this.setTextChannelCounterName(properties.textChannelCounterName);
        }
        if ( properties.hasOwnProperty('voiceChannelCounterName') ){
            this.setVoiceChannelCounterName(properties.voiceChannelCounterName);
        }
        if ( properties.hasOwnProperty('channelCounterName') ){
            this.setChannelCounterName(properties.channelCounterName);
        }
        if ( properties.hasOwnProperty('botCounterName') ){
            this.setBotCounterName(properties.botCounterName);
        }
        if ( properties.hasOwnProperty('memberCounterEnabled') ){
            this.setMemberCounterEnabled(properties.memberCounterEnabled);
        }
        if ( properties.hasOwnProperty('userCounterEnabled') ){
            this.setUserCounterEnabled(properties.userCounterEnabled);
        }
        if ( properties.hasOwnProperty('textChannelCounterEnabled') ){
            this.setTextChannelCounterEnabled(properties.textChannelCounterEnabled);
        }
        if ( properties.hasOwnProperty('voiceChannelCounterEnabled') ){
            this.setVoiceChannelCounterEnabled(properties.voiceChannelCounterEnabled);
        }
        if ( properties.hasOwnProperty('channelCounterEnabled') ){
            this.setChannelCounterEnabled(properties.channelCounterEnabled);
        }
        if ( properties.hasOwnProperty('botCounterEnabled') ){
            this.setBotCounterEnabled(properties.botCounterEnabled);
        }
        return this;
    }

    getProperties(){
        return {
            guildID: this.#guildID,
            memberCounterName: this.#memberCounterName,
            userCounterName: this.#userCounterName,
            textChannelCounterName: this.#textChannelCounterName,
            voiceChannelCounterName: this.#voiceChannelCounterName,
            channelCounterName: this.#channelCounterName,
            botCounterName: this.#botCounterName,
            memberCounterEnabled: this.#memberCounterEnabled,
            userCounterEnabled: this.#userCounterEnabled,
            channelCounterEnabled: this.#channelCounterEnabled,
            textChannelCounterEnabled: this.#textChannelCounterEnabled,
            voiceChannelCounterEnabled: this.#voiceChannelCounterEnabled,
            botCounterEnabled: this.#botCounterEnabled
        };
    }

    async save(){
        const properties = this.getProperties();
        delete properties.guildID;
        await Database.getConnection().collection('memberCountConfig').updateOne({
            guildID: this.#guildID
        }, {
            $set: properties
        }, {
            upsert: true
        });
    }

    async delete(){
        await Database.getConnection().collection('memberCountConfig').deleteOne({
            guildID: this.#guildID
        });
    }
}

Object.defineProperty(MemberCountConfig, 'DEFAULT_MEMBER_COUNTER_NAME', {
    value: 'Member count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_USER_COUNTER_NAME', {
    value: 'User count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_TEXT_CHANNEL_COUNTER_NAME', {
    value: 'Text channel count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_VOICE_CHANNEL_COUNTER_NAME', {
    value: 'Voice channel count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_CHANNEL_COUNTER_NAME', {
    value: 'Channel count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_BOT_COUNTER_NAME', {
    value: 'Bot count',
    writable: false
});

module.exports = MemberCountConfig;
