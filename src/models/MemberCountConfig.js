'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class MemberCountConfig extends Model {
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

    #guildID = null;
    #memberCounterName = MemberCountConfig.DEFAULT_MEMBER_COUNTER_NAME;
    #userCounterName = MemberCountConfig.DEFAULT_USER_COUNTER_NAME;
    #textChannelCounterName = MemberCountConfig.DEFAULT_TEXT_CHANNEL_COUNTER_NAME;
    #voiceChannelCounterName = MemberCountConfig.DEFAULT_VOICE_CHANNEL_COUNTER_NAME;
    #channelCounterName = MemberCountConfig.DEFAULT_CHANNEL_COUNTER_NAME;
    #botCounterName = MemberCountConfig.DEFAULT_BOT_COUNTER_NAME;
    #staticEmojiCounterName = MemberCountConfig.DEFAULT_STATIC_EMOJI_COUNTER_NAME;
    #animatedEmojiCounterName = MemberCountConfig.DEFAULT_ANIMATED_EMOJI_COUNTER_NAME;
    #emojiCounterName = MemberCountConfig.DEFAULT_EMOJI_COUNTER_NAME;
    #roleCounterName = MemberCountConfig.DEFAULT_ROLE_COUNTER_NAME;
    #memberCounterEnabled = false;
    #userCounterEnabled = false;
    #textChannelCounterEnabled = false;
    #voiceChannelCounterEnabled = false;
    #channelCounterEnabled = false;
    #botCounterEnabled = false;
    #staticEmojiCounterEnabled = false;
    #animatedEmojiCounterEnabled = false;
    #emojiCounterEnabled = false;
    #roleCounterEnabled = false;

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

    setStaticEmojiCounterName(staticEmojiCounterName){
        if ( staticEmojiCounterName === '' || typeof staticEmojiCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#staticEmojiCounterName = staticEmojiCounterName;
        return this;
    }

    getStaticEmojiCounterName(){
        return this.#staticEmojiCounterName;
    }

    setAnimatedEmojiCounterName(animatedEmojiCounterName){
        if ( animatedEmojiCounterName === '' || typeof animatedEmojiCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#animatedEmojiCounterName = animatedEmojiCounterName;
        return this;
    }

    getAnimatedEmojiCounterName(){
        return this.#animatedEmojiCounterName;
    }

    setEmojiCounterName(emojiCounterName){
        if ( emojiCounterName === '' || typeof emojiCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#emojiCounterName = emojiCounterName;
        return this;
    }

    getEmojiCounterName(){
        return this.#emojiCounterName;
    }

    setRoleCounterName(roleCounterName){
        if ( roleCounterName === '' || typeof roleCounterName !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 1);
        }
        this.#roleCounterName = roleCounterName;
        return this;
    }

    getRoleCounterName(){
        return this.#roleCounterName;
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

    setStaticEmojiCounterEnabled(staticEmojiCounterEnabled){
        this.#staticEmojiCounterEnabled = staticEmojiCounterEnabled === true;
        return this;
    }

    getStaticEmojiCounterEnabled(){
        return this.#staticEmojiCounterEnabled;
    }

    setAnimatedEmojiCounterEnabled(animatedEmojiCounterEnabled){
        this.#animatedEmojiCounterEnabled = animatedEmojiCounterEnabled === true;
        return this;
    }

    getAnimatedEmojiCounterEnabled(){
        return this.#animatedEmojiCounterEnabled;
    }

    setEmojiCounterEnabled(emojiCounterEnabled){
        this.#emojiCounterEnabled = emojiCounterEnabled === true;
        return this;
    }

    getEmojiCounterEnabled(){
        return this.#emojiCounterEnabled;
    }

    setRoleCounterEnabled(roleCounterEnabled){
        this.#roleCounterEnabled = roleCounterEnabled === true;
        return this;
    }

    getRoleCounterEnabled(){
        return this.#roleCounterEnabled;
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
        if ( properties.hasOwnProperty('staticEmojiCounterName') ){
            this.setStaticEmojiCounterName(properties.staticEmojiCounterName);
        }
        if ( properties.hasOwnProperty('animatedEmojiCounterName') ){
            this.setAnimatedEmojiCounterName(properties.animatedEmojiCounterName);
        }
        if ( properties.hasOwnProperty('emojiCounterName') ){
            this.setEmojiCounterName(properties.emojiCounterName);
        }
        if ( properties.hasOwnProperty('roleCounterName') ){
            this.setRoleCounterName(properties.roleCounterName);
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
        if ( properties.hasOwnProperty('staticEmojiCounterEnabled') ){
            this.setStaticEmojiCounterEnabled(properties.staticEmojiCounterEnabled);
        }
        if ( properties.hasOwnProperty('animatedEmojiCounterEnabled') ){
            this.setAnimatedEmojiCounterEnabled(properties.animatedEmojiCounterEnabled);
        }
        if ( properties.hasOwnProperty('emojiCounterEnabled') ){
            this.setEmojiCounterEnabled(properties.emojiCounterEnabled);
        }
        if ( properties.hasOwnProperty('roleCounterEnabled') ){
            this.setRoleCounterEnabled(properties.roleCounterEnabled);
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
            staticEmojiCounterName: this.#staticEmojiCounterName,
            animatedEmojiCounterName: this.#animatedEmojiCounterName,
            emojiCounterName: this.#emojiCounterName,
            roleCounterName: this.#roleCounterName,
            memberCounterEnabled: this.#memberCounterEnabled,
            userCounterEnabled: this.#userCounterEnabled,
            channelCounterEnabled: this.#channelCounterEnabled,
            textChannelCounterEnabled: this.#textChannelCounterEnabled,
            voiceChannelCounterEnabled: this.#voiceChannelCounterEnabled,
            botCounterEnabled: this.#botCounterEnabled,
            staticEmojiCounterEnabled: this.#staticEmojiCounterEnabled,
            animatedEmojiCounterEnabled: this.#animatedEmojiCounterEnabled,
            emojiCounterEnabled: this.#emojiCounterEnabled,
            roleCounterEnabled: this.#roleCounterEnabled
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

Object.defineProperty(MemberCountConfig, 'DEFAULT_STATIC_EMOJI_COUNTER_NAME', {
    value: 'Static emoji count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_ANIMATED_EMOJI_COUNTER_NAME', {
    value: 'Animated emoji count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_EMOJI_COUNTER_NAME', {
    value: 'Emoji count',
    writable: false
});

Object.defineProperty(MemberCountConfig, 'DEFAULT_ROLE_COUNTER_NAME', {
    value: 'Role count',
    writable: false
});

module.exports = MemberCountConfig;
