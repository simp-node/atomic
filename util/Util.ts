import { stripIndents } from 'common-tags';
import { AkairoClient } from 'discord-akairo';
import { Command } from 'discord-akairo';
import {
	PermissionString,
	MessageEmbed,
	MessageEmbedOptions,
	Message,
	Collection
} from 'discord.js';
import ms from 'ms';

enum Badges {
	BRAVERY = '<:bbravery:818083760142417922>',
	GOLDENBUG = '<:bgoldenbug:818083760221585419>',
	EVENTS = '<:bevents:818083760284893226>',
	BALANCE = '<:bbalancee:818083760301801492>',
	EARLY = '<:bearly:818083760348069938>',
	BRILLIANCE = '<:bbrilliance:818083760380706826>',
	BUGHUNTER = '<:bbughunter:818083760398401546>',
	PARTNER = '<:bpartner:818083760435232788>',
	VERIFIEDDEV = '<:bverifieddev:818083760440082432>',
	STAFF = '<:bstaff:818083760499064872>',
	VERIFIEDBOT = '<:bverifiedbot:818083760645734430>'
}

export abstract class Util {
	public static normalize(str: string[]): string[] {
		return str.map((s) => {
			return s.includes('_')
				? s
						.split('_')
						.map((a) => {
							return `${a.charAt(0).toUpperCase()}${a.slice(1).toLowerCase()}`;
						})
						.join(' ')
				: `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
		});
	}

	public static trim(
		str: string[] | PermissionString[],
		max: number = 10
	): string {
		return str.length > max
			? `${str.slice(0, max).join(', ')} and ${str.length - max} more...`
			: `${str.join(', ')}`;
	}

	public static status(status: string): string {
		if (status.length === 3) {
			return `Do Not Disturb`;
		} else {
			return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
		}
	}

	public static capitalize(str: string): string {
		if (str.includes(' ')) {
			return str
				.split(' ')
				.map((v) => {
					v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
				})
				.join(' ');
		} else {
			return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
		}
	}

	public static badges(str: string[]): string[] {
		return str
			.map((v) => {
				switch (v) {
					case 'DISCORD_EMPLOYEE':
						return Badges.STAFF;

					case 'PARTNERED_SERVER_OWNER':
						return Badges.PARTNER;

					case 'DISCORD_PARTNER':
						return Badges.PARTNER;

					case 'HYPESQUAD_EVENTS':
						return Badges.EVENTS;

					case 'BUGHUNTER_LEVEL_1':
						return Badges.BUGHUNTER;

					case 'HOUSE_BRAVERY':
						return Badges.BRAVERY;

					case 'HOUSE_BRILLIANCE':
						return Badges.BRILLIANCE;

					case 'HOUSE_BALANCE':
						return Badges.BRILLIANCE;

					case 'EARLY_SUPPORTER':
						return Badges.EARLY;

					case 'TEAM_USER':
						return Badges.STAFF;

					case 'SYSTEM':
						return 'System';

					case 'BUGHUNTER_LEVEL_2':
						return Badges.GOLDENBUG;

					case 'VERIFIED_BOT':
						return Badges.VERIFIEDBOT;

					case 'VERIFIED_DEVELOPER':
						return Badges.VERIFIEDDEV;
				}
			})
			.filter((v) => !!v);
	}

	public static Embed(
		options: MessageEmbedOptions,
		message: Message
	): MessageEmbed {
		return new MessageEmbed(options)
			.setFooter(
				`Requested by: ${message.author.tag}`,
				message.author.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp();
	}

	public static search(
		query: string,
		modules: Collection<string, Command>,
		message: Message
	) {
		if (!query) return null;
		try {
			const commands = modules.map((cmd) => {
				return {
					...cmd,
					aliases: cmd.aliases.filter((v) => v !== cmd.id)
				};
			});
			let idRES = commands
				.map((v) => {
					return v.id.match(query);
				})
				.filter((v) => {
					return v !== null;
				});
			let aliasRES = commands
				.map((v) => {
					return v.aliases.map((v) => {
						return v.match(query);
					});
				})
				.filter((v) => {
					return !v.includes(null) && v.length > 0 && v !== null;
				})
				.flat();
			const cmd = [...idRES, ...aliasRES]
				.sort((a, b) => {
					return a[0].length - b[0].length;
				})
				.sort((a, b) => {
					return a['index'] - b['index'];
				});
			if (cmd[0]['input'].includes('-')) return null;
			const r = cmd[0]
				? modules
						.filter((v: any) => {
							return !!v.guild ? v.guild === message.guild.id : true;
						})
						.find((c) => {
							return c.id === cmd[0]['input'];
						}) ||
				  modules
						.filter((v: any) => {
							return !!v.guild ? v.guild === message.guild.id : true;
						})
						.find((c) => {
							return c.aliases.includes(cmd[0]['input']);
						})
				: null;
			return r;
		} catch (err) {
			return null;
		}
	}

	public static help(cmd: Command, client: AkairoClient) {
		return client.util
			.embed()
			.setDescription(
				stripIndents`
				> **❯** Name: ${cmd.id}
				> **❯** Aliases: ${cmd.aliases ? cmd.aliases.join(', ') : 'None'}
				> **❯** Category: ${cmd.categoryID}
				> **❯** Description: ${cmd.description.content ?? 'None'}
				> **❯** Cooldown: ${ms(cmd.cooldown ?? cmd.handler.defaultCooldown, {
					long: true
				})}
				> **❯** Usage: ${cmd.description.usage ?? 'None'}
				> **❯** Examples: ${
					cmd.description.examples
						? `\n> \`${cmd.description.examples.join('`\n> `')}\``
						: 'None'
				}
				${
					cmd.description.subcommands
						? `> **❯** Subcommands: ${`\n> \`${cmd.description.subcommands.join(
								'`, `'
						  )}\``}`
						: ''
				}
			${cmd.ownerOnly ? '**Developer Only!**' : ''}`
			)
			.setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
	}
}
