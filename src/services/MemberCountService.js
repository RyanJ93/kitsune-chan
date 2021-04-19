'use strict';

const crypto = require('crypto');
const lala = require('@lala.js/core');
const MemberCountCounterSet = require('../models/MemberCountCounterSet');
const MemberCountConfig = require('../models/MemberCountConfig');

/**
 * @typedef {Object} CounterSet
 *
 * @property {number} users
 * @property {number} bots
 * @property {number} textChannels
 * @property {number} voiceChannels
 * @property {number} staticEmojis
 * @property {number} animatedEmojis
 * @property {number} roles
 */

class MemberCountService extends lala.Service {
    /**
     *
     * @param {module:"discord.js".GuildChannel} channel
     *
     * @returns {Promise<boolean>}
     */
    static async #channelShouldBeIgnored(channel){
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(channel.guild.id);
        const transactionCache = lala.CacheRepository.get('transactionCache');
        let shouldBeIgnored = Object.values(memberCountCounterSet.getChannelIDs()).indexOf(channel.id) >= 0;
        if ( !shouldBeIgnored ){
            const fingerprint = crypto.createHash('md5').update(channel.name).digest().toString('hex');
            const results = await transactionCache.hasMulti([
                'memberCount.counterChannel.#' + fingerprint,
                'memberCount.counterChannel.#' + channel.id
            ]);
            shouldBeIgnored = Object.values(results).some((result) => result === true);
        }
        return shouldBeIgnored;
    }

    /**
     *
     * @param {string} channel
     *
     * @returns {boolean}
     */
    static isSupportedChannel(channel){
        return [
            'members', 'users', 'bots', 'member', 'user', 'bot',
            'text-channels', 'voice-channels', 'channels', 'text-channel', 'voice-channel', 'channel',
            'static-emojis', 'animated-emojis', 'emojis', 'static-emoji', 'animated-emoji', 'emoji',
            'roles', 'role'
        ].indexOf(channel) !== -1;
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     *
     * @returns {Promise<void>}
     */
    static async refreshEveryGuildCounters(client){
        const processes = [];
        for ( const [guildID, guild] of client.guilds.cache ){
            processes.push(new Promise((resolve, reject) => {
                const memberCountService = new MemberCountService(guild);
                memberCountService.refreshCounters(true, true, true, true).then(() => {
                    resolve();
                }).catch((ex) => {
                    reject(ex);
                });
            }));
        }
        await Promise.all(processes);
    }

    /**
     *
     * @param {module:"discord.js".GuildMember} member
     *
     * @returns {Promise<void>}
     */
    static triggerMembersCountRefresh(member){
        const memberCountService = new MemberCountService(member.guild);
        return memberCountService.refreshCounters(true, false, false, false);
    }

    /**
     *
     * @param {module:"discord.js".GuildChannel} channel
     *
     * @returns {Promise<void>}
     */
    static async triggerChannelsCountRefresh(channel){
        const shouldBeIgnored = await MemberCountService.#channelShouldBeIgnored(channel);
        if ( !shouldBeIgnored ){
            const memberCountService = new MemberCountService(channel.guild);
            await memberCountService.refreshCounters(false, true, false, false);
        }
    }

    /**
     *
     * @param {module:"discord.js".GuildEmoji} emoji
     *
     * @returns {Promise<void>}
     */
    static async triggerEmojisCountRefresh(emoji){
        const memberCountService = new MemberCountService(emoji.guild);
        return memberCountService.refreshCounters(false, false, true, false);
    }

    /**
     *
     * @param {module:"discord.js".Role} role
     *
     * @returns {Promise<void>}
     */
    static async triggerRolesCountRefresh(role){
        const memberCountService = new MemberCountService(role.guild);
        return memberCountService.refreshCounters(false, false, false, true);
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     */
    static installObservers(client){
        client.on('guildMemberAdd', (member) => {
            MemberCountService.triggerMembersCountRefresh(member);
        });
        client.on('guildMemberRemove', (member) => {
            MemberCountService.triggerMembersCountRefresh(member);
        });
        client.on('channelCreate', (channel) => {
            MemberCountService.triggerChannelsCountRefresh(channel);
        });
        client.on('channelDelete', (channel) => {
            MemberCountService.triggerChannelsCountRefresh(channel);
        });
        client.on('emojiCreate', (emoji) => {
            MemberCountService.triggerEmojisCountRefresh(emoji);
        });
        client.on('emojiDelete', (emoji) => {
            MemberCountService.triggerEmojisCountRefresh(emoji);
        });
        client.on('roleCreate', (role) => {
            MemberCountService.triggerRolesCountRefresh(role);
        });
        client.on('roleDelete', (role) => {
            MemberCountService.triggerRolesCountRefresh(role);
        });
    }

    /**
     * @type {module:"discord.js".Guild}
     */
    #guild = null;

    /**
     * @type {?MemberCountCounterSet}
     */
    #memberCountCounterSet = null;

    /**
     * @type {?MemberCountConfig}
     */
    #memberCountConfig = null;

    /**
     *
     * @param {string} fullChannelName
     *
     * @returns {Promise<module:"discord.js".VoiceChannel>}
     */
    async #createCounterChannel(fullChannelName){
        const transactionCache = lala.CacheRepository.get('transactionCache');
        const fingerprint = crypto.createHash('md5').update(fullChannelName).digest().toString('hex');
        // TODO: Enable TTL once upgraded to Lala.js 0.2.0
        //await transactionCache.set('memberCount.counterChannel.#' + fingerprint, true, { ttl: 600, overwrite: true });
        await transactionCache.set('memberCount.counterChannel.#' + fingerprint, true, { overwrite: true });
        const channel = await this.#guild.channels.create(fullChannelName, {type: 'voice', userLimit: 0, position: 0});
        //await transactionCache.set('memberCount.counterChannel.#' + channel.id, true, { ttl: 600, overwrite: true });
        await transactionCache.set('memberCount.counterChannel.#' + channel.id, true, { overwrite: true });
        return channel;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateMembersCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getMemberCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getMemberCounterName() + ': ' + this.#memberCountCounterSet.getMemberCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getMemberCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setMemberCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getMemberCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getMemberCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setMemberCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateUserCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getUserCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getUserCounterName() + ': ' + this.#memberCountCounterSet.getUserCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getUserCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setUserCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getUserCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getUserCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setUserCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateBotCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getBotCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getBotCounterName() + ': ' + this.#memberCountCounterSet.getBotCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getBotCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setBotCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getBotCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getBotCounterChannelID());
            if ( channel != null ){
                await channel.delete();
                this.#memberCountCounterSet.setBotCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getChannelCounterName() + ': ' + this.#memberCountCounterSet.getChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateTextChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getTextChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getTextChannelCounterName() + ': ' + this.#memberCountCounterSet.getTextChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getTextChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setTextChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getTextChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getTextChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setTextChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateVoiceChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getVoiceChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getVoiceChannelCounterName() + ': ' + this.#memberCountCounterSet.getVoiceChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getVoiceChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setVoiceChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getVoiceChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getVoiceChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setVoiceChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateStaticEmojiCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getStaticEmojiCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getStaticEmojiCounterName() + ': ' + this.#memberCountCounterSet.getStaticEmojiCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getStaticEmojiCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setStaticEmojiCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getStaticEmojiCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getStaticEmojiCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setStaticEmojiCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateAnimatedEmojiCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getAnimatedEmojiCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getAnimatedEmojiCounterName() + ': ' + this.#memberCountCounterSet.getAnimatedEmojiCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getAnimatedEmojiCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setAnimatedEmojiCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getAnimatedEmojiCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getAnimatedEmojiCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setAnimatedEmojiCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateEmojiCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getEmojiCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getEmojiCounterName() + ': ' + this.#memberCountCounterSet.getEmojiCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getEmojiCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setEmojiCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getEmojiCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getEmojiCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setEmojiCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateRoleCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getRoleCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getRoleCounterName() + ': ' + this.#memberCountCounterSet.getRoleCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getRoleCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setRoleCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getRoleCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getRoleCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setRoleCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<CounterSet>}
     */
    async #countGuildEntities(){
        const counters = {users: 0, bots: 0, textChannels: 0, voiceChannels: 0, staticEmojis: 0, animatedEmojis: 0, roles: 0};
        const members = await this.#guild.members.fetch();
        members.forEach((member) => {
            counters[member.user.bot ? 'bots' : 'users']++;
        });
        const ignoredChannelIDs = Object.values(this.#memberCountCounterSet.getChannelIDs());
        for ( const [channelID, channel] of this.#guild.channels.cache ){
            if ( ignoredChannelIDs.indexOf(channelID) === -1 ){
                if ( channel.type === 'text' ){
                    counters.textChannels++;
                }else if ( channel.type === 'voice' ){
                    counters.voiceChannels++;
                }
            }
        }
        for ( const [emojiID, emoji] of this.#guild.emojis.cache ){
            counters[emoji.animated ? 'animatedEmojis' : 'staticEmojis']++;
        }
        const roles = await this.#guild.roles.fetch();
        counters.roles = roles.cache.size;
        return counters;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async #updateCounterChannels(){
        const results = await Promise.all([
            this.#updateMembersCounterChannel(),
            this.#updateUserCounterChannel(),
            this.#updateTextChannelCounterChannel(),
            this.#updateVoiceChannelCounterChannel(),
            this.#updateChannelCounterChannel(),
            this.#updateBotCounterChannel(),
            this.#updateStaticEmojiCounterChannel(),
            this.#updateAnimatedEmojiCounterChannel(),
            this.#updateEmojiCounterChannel(),
            this.#updateRoleCounterChannel()
        ]);
        const shouldBeSaved = results.some((element) => { return element === true });
        if ( shouldBeSaved ){
            await this.#memberCountCounterSet.save();
        }
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
     * @returns {MemberCountService}
     */
    setGuild(guild){
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
     * @param {boolean} [members=true]
     * @param {boolean} [channels=true]
     * @param {boolean} [emojis=true]
     * @param {boolean} [roles=true]
     *
     * @returns {Promise<void>}
     */
    async refreshCounters(members = true, channels = true, emojis = true, roles = true){
        if ( this.#memberCountCounterSet === null ){
            this.#memberCountCounterSet = await MemberCountCounterSet.findOrNew(this.#guild.id);
        }
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        const counters = await this.#countGuildEntities();
        if ( members === true ){
            this.#memberCountCounterSet.setUserCount(counters.users).setBotCount(counters.bots);
        }
        if ( channels === true ){
            this.#memberCountCounterSet.setTextChannelCount(counters.textChannels).setVoiceChannelCount(counters.voiceChannels);
        }
        if ( emojis === true ){
            this.#memberCountCounterSet.setStaticEmojiCount(counters.staticEmojis).setAnimatedEmojiCount(counters.animatedEmojis);
        }
        if ( roles === true ){
            this.#memberCountCounterSet.setRoleCount(counters.roles);
        }
        await Promise.all([
            this.#updateCounterChannels(),
            this.#memberCountCounterSet.save()
        ]);
    }

    /**
     *
     * @param {string} counter
     * @param {boolean} enabled
     *
     * @returns {Promise<void>}
     */
    async setCounterEnabled(counter, enabled){
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        switch ( counter ){
            case 'members':
            case 'member': {
                this.#memberCountConfig.setMemberCounterEnabled(enabled);
            }break;
            case 'users':
            case 'user': {
                this.#memberCountConfig.setUserCounterEnabled(enabled);
            }break;
            case 'text-channels':
            case 'text-channel': {
                this.#memberCountConfig.setTextChannelCounterEnabled(enabled);
            }break;
            case 'voice-channels':
            case 'voice-channel': {
                this.#memberCountConfig.setVoiceChannelCounterEnabled(enabled);
            }break;
            case 'channels':
            case 'channel': {
                this.#memberCountConfig.setChannelCounterEnabled(enabled);
            }break;
            case 'bots':
            case 'bot': {
                this.#memberCountConfig.setBotCounterEnabled(enabled);
            }break;
            case 'static-emojis':
            case 'static-emoji': {
                this.#memberCountConfig.setStaticEmojiCounterEnabled(enabled);
            }break;
            case 'animated-emojis':
            case 'animated-emoji': {
                this.#memberCountConfig.setAnimatedEmojiCounterEnabled(enabled);
            }break;
            case 'emojis':
            case 'emoji': {
                this.#memberCountConfig.setEmojiCounterEnabled(enabled);
            }break;
            case 'roles':
            case 'role': {
                this.#memberCountConfig.setRoleCounterEnabled(enabled);
            }break;
            default: {
                throw new lala.InvalidArgumentException('Invalid counter type.', 1);
            }
        }
        await this.#memberCountConfig.save();
    }

    /**
     *
     * @param {string} counter
     * @param {string} name
     *
     * @returns {Promise<void>}
     */
    async setCounterName(counter, name){
        if ( name === '' || typeof name !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 2);
        }
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        switch ( counter ){
            case 'members':
            case 'member': {
                this.#memberCountConfig.setMemberCounterName(name);
            }break;
            case 'users':
            case 'user': {
                this.#memberCountConfig.setUserCounterName(name);
            }break;
            case 'text-channels':
            case 'text-channel': {
                this.#memberCountConfig.setTextChannelCounterName(name);
            }break;
            case 'voice-channels':
            case 'voice-channel': {
                this.#memberCountConfig.setVoiceChannelCounterName(name);
            }break;
            case 'channels':
            case 'channel': {
                this.#memberCountConfig.setChannelCounterName(name);
            }break;
            case 'bots':
            case 'bot': {
                this.#memberCountConfig.setBotCounterName(name);
            }break;
            case 'static-emojis':
            case 'static-emoji': {
                this.#memberCountConfig.setStaticEmojiCounterName(name);
            }break;
            case 'animated-emojis':
            case 'animated-emoji': {
                this.#memberCountConfig.setAnimatedEmojiCounterName(name);
            }break;
            case 'emojis':
            case 'emoji': {
                this.#memberCountConfig.setEmojiCounterName(name);
            }break;
            case 'roles':
            case 'role': {
                this.#memberCountConfig.setRoleCounterName(name);
            }break;
            default: {
                throw new lala.InvalidArgumentException('Invalid counter type.', 1);
            }
        }
        await this.#memberCountConfig.save();
    }
}

module.exports = MemberCountService;
