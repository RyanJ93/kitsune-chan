'use strict';

const lala = require('@lala.js/core');
const GuildConfig = require('./models/GuildConfig');
const BotException = require('./exceptions/BotException');
const LocaleManager = require('./support/LocaleManager');
const { MessageEmbed } = require('discord.js');

class CommandRouter {
    static #client = null;
    static #commands = new Map();

    static async #getGuildConfig(guildID){
        let guildConfig = await GuildConfig.find(guildID);
        if ( guildConfig === null ){
            guildConfig = new GuildConfig(guildID);
            await guildConfig.save();
        }
        return guildConfig;
    }

    static async #handleCommandException(ex, message){
        const locale = LocaleManager.getLocaleByGuildMember(message.member);
        const title = LocaleManager.getLabel('common.error.title', locale);
        const messageEmbed = new MessageEmbed();
        const description = ex instanceof BotException ? ex.message : LocaleManager.getLabel('common.error.generic', locale);
        messageEmbed.setColor('#e74c3c').setTitle(title).setDescription(description);
        await message.channel.send(messageEmbed);
        if ( !( ex instanceof BotException ) ){
            throw ex;
        }
    }

    static async #handleMessage(message){
        if ( !message.author.bot ){
            const guildConfig = await CommandRouter.#getGuildConfig(message.channel.guild.id);
            if ( guildConfig !== null && message.content.indexOf(guildConfig.getPrefix()) === 0 ){
                const start = guildConfig.getPrefix().length;
                const end = message.content.indexOf(' ');
                const commandName = end === -1 ? message.content.substr(start) : message.content.substr(start, end - 1);
                const command = CommandRouter.#commands.get(commandName);
                if ( typeof command !== 'undefined' ){
                    if ( command.adminRequired && !message.member.hasPermission('ADMINISTRATOR') ){
                        await message.channel.send(LocaleManager.getLabel('common.adminRequired'));
                        return;
                    }
                    message.cleanedContent = message.content.substr(start + commandName.length + 1);
                    const controller = new command.controller(CommandRouter.#client, guildConfig, message);
                    controller[command.method]().catch((ex) => {
                        CommandRouter.#handleCommandException(ex, message);
                    });
                }
            }
        }
    }

    static #init(){
        CommandRouter.#client.on('message', async (message) => {
            await CommandRouter.#handleMessage(message);
        });
    }

    static setClient(client){
        CommandRouter.#client = client;
        CommandRouter.#init();
    }

    static getClient(){
        return CommandRouter.#client;
    }

    static registerCommand(command, controller, method, adminRequired = false){
        CommandRouter.#commands.set(command, {
            controller: controller,
            method: method,
            adminRequired: ( adminRequired === true )
        });
    }

    static commandExists(command){
        return CommandRouter.#commands.has(command);
    }
}

module.exports = CommandRouter;
