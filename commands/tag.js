const Command = require('../base/Command.js');

class Tag extends Command {
  constructor(client) {
    super(client, {
      name: 'tag',
      description: 'Show or modify tags.',
      category: 'Support',
      usage: 'tag <action> [tagname] <contents>.',
      aliases: ['t', 'tags'],
      botPerms: ['SEND_MESSAGES']
    });
  }
  
  async run(message, args, level) {
    if (!args[0] && !message.flags.length) message.flags.push('list');
    const tagName = args.shift();
    const tagDescription = args.join(' ');
    
    if (!message.flags.length) {
      const tag = await this.client.tags.findOne({where: {name: tagName}});
      if (tag) {
        tag.increment('usage_count');
        return message.channel.send(tag.get('description'));
      }
      return message.reply(`Could not find tag: \`${tagName}\``);
    }

    if (message.flags[0] === 'list') {
      const tagList = await this.client.tags.findAll({attribute: ['name']});
      const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';
      return message.channel.send(`Tags: ${tagString}`);
    }

    if (level < 8) return;

    try {
      switch (message.flags[0]) {
        case ('add'): {
          const tag = await this.client.tags.create({ name: tagName, description: tagDescription, username: message.author.username });
          message.reply(`Tag \`${tag.name}\` added.`);
          break;
        }

        case 'edit': {
          const affectedRows = await this.client.tags.update({ description: tagDescription }, { where: { name: tagName } });
          if (affectedRows > 0) {
            return message.reply(`Tag ${tagName} was edited.`);
          }
          message.reply(`Could not find a tag with name ${tagName}.`);
          break;
        }

        case 'del': {
          const rowCount = await this.client.tags.destroy({ where: { name: tagName } });
          if (!rowCount) return message.reply('That tag did not exist.');
          message.reply('Tag deleted.');
          break;
        }

        case 'info': {
          const tag = await this.client.tags.findOne({ where: { name: tagName } });
          if (tag) {
            return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
          }
          message.reply(`Could not find tag: ${tagName}`);
          break;
        }

        default:
          break;
      }
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError')
        throw 'That tag already exists.';
    }
  }
}

module.exports = Tag;