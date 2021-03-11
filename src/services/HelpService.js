'use strict';

const lala = require('@lala.js/core');

class HelpService extends lala.Service {
    static #groups = new Map();
    static #commands = new Map();

    static registerCommand(name, group, labels){
        if ( name === '' || typeof name !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid name.', 1);
        }
        if ( group === '' || typeof group !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid group.', 2);
        }
        if ( labels === null || typeof labels !== 'object' ){
            throw new lala.InvalidArgumentException('Invalid labels.', 3);
        }
        let stack = HelpService.#groups.get(group);
        if ( typeof stack === 'undefined' ){
            stack = new Map();
            HelpService.#groups.set(group, stack);
        }
        stack.set(name, labels);
        HelpService.#commands.set(name, labels);
    }

    static getHelpMessageContent(locale){
        let message = '';
        for ( const [group, stack] of HelpService.#groups ){
            message += group + ':\n';
            for ( const [command, labels] of stack ){
                if ( labels.hasOwnProperty(locale) ){
                    message += command + ': ' + labels[locale] + '\n';
                }
            }
        }
        return message;
    }

    static getHelpMessageContentByCommand(command, locale){
        let message = '', labels = HelpService.#commands.get(command);
        if ( typeof labels !== 'undefined' && labels.hasOwnProperty(locale) ){
            message = labels[locale];
        }
        return message;
    }
}

module.exports = HelpService;
