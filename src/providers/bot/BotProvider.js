'use strict';

const lala = require('@lala.js/core');
const Discord = require('discord.js');
const CommandRouter = require('../../CommandRouter');
const GuildConfig = require('../../models/GuildConfig');
const config = require('../../../config/config.json');

class BotProvider extends lala.Provider {
    static async _bootstrapBot(){
        return new Promise((resolve) => {
            const intents = new Discord.Intents([Discord.Intents.NON_PRIVILEGED, 'GUILD_MEMBERS']);
            const client = new Discord.Client({
                ws: { intents }
            });
            client.on('ready', () => {
                CommandRouter.setClient(client);
                resolve(client);
            });
            client.login(config.token);
        });
    }

    static async _bindGuildEventsHandlers(client){
        client.on('guildCreate', async (guild) => {
            let guildConfig = await GuildConfig.find(guild.id);
            if ( guildConfig === null ){
                guildConfig = new GuildConfig(guild.id);
                await guildConfig.save();
            }
        });
    }

    static async setup(){
        const client = await BotProvider._bootstrapBot();
        await BotProvider._bindGuildEventsHandlers(client);
    }
}

module.exports = BotProvider;
