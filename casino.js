const Discord = require('discord.js');
const client = new Discord.Client();
const eco = require("./economy.js");

var config = {
    botPrefix: "!"
};

    client.on("ready", () => {
	// This event will run if the bot starts, and logs in, successfully.
	console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
	// Example of changing the bot's playing game to something useful. `client.user` is what the
	// docs refer to as the "ClientUser".
	client.user.setActivity(`Type !help for a list of my commands.`);
  });

	console.log("MODULE -> Casino Module Loaded");
	this.probability = function(n) {
	  return Math.random() <= n;
	};
	this.formatter = new Intl.NumberFormat('en-US', {
	  style: 'currency',
	  currency: 'USD',
	  minimumFractionDigits: 0
	});
	this.isNumber = function(str) {
	  if (typeof str != "string") return false // we only process strings!
	  // could also coerce to string: str = ""+str
	  return !isNaN(str) && !isNaN(parseFloat(str))
	}
	this.error = function(m, str) {
		var embed = new Discord.RichEmbed()
		.setAuthor("Error", client.user.displayAvatarURL);
		embed.setColor(0xFF0000).setDescription(str);
		m.reply(embed);
		return false;
	}
	this.fail = function(m, title, str) {
		var embed = new Discord.RichEmbed()
		.setAuthor(`${title}`, client.user.displayAvatarURL);
		embed.setColor(0xFF0000).setDescription(str);
		m.reply(embed);
	}
	this.success = function(m, title, str) {
		var embed = new Discord.RichEmbed()
		.setAuthor(`${title}`, client.user.displayAvatarURL);
		embed.setColor(0x00FF00).setDescription(str);
		m.reply(embed);
	}
	this.delays = [];
	this.delay = function(m, func, delay) {
		var d = new Date();
		d.setSeconds(d.getSeconds() + delay);
		
		var uid = m.author.id;
		var found = false;
		var row = {uid, func, d};
		for (var i = 0; i < this.delays.length; i++) {
			if (this.delays[i].uid == uid && this.delays[i].func == func) {
				var seconds = (this.delays[i].d.getTime() - new Date().getTime()) / 1000;
				if (seconds <= 0) {this.delays.splice(i);this.delays.push(row);return true;}
				var time = new Date(1000 * seconds).toISOString().substr(11, 8);
				time = parseInt(time.split(':')[1]) + " mins " + time.split(':')[2] + " secs"; 
				cs.error(m, `You cannot \`${func}\` for ${time}.`);
				return false;
			}
		}
		
		this.delays.push(row);
		return true;
	};
	var cs = this;
	this.checkBalance = async function(func,m,amount) {
		var output = await eco.FetchBalance(m.author.id).catch(console.error)
		if (!amount) return cs.error(m, `Please specify the amount you want to ${func}.`);
		if (!cs.isNumber(amount) && amount != "all" && amount != "half") return cs.error(m, "Please specify a valid amount.");
		if (amount != "" && amount != null) amount = amount.replace(",", "").split(".")[0];
		if (amount == 0) amount = 1;
		if (func == "withdraw") output.wallet = output.bank;
		if (amount == "all") amount = output.wallet;
		if (amount == "half" && output.wallet >= 2) amount = output.wallet / 2;
		if (output.wallet < amount || (amount == "half" && output.wallet < 2)) return cs.error(m, "You don\'t have enough money to do this.");
		return amount;
	}
	this.casinoCommands = [
		{
			"cmd": "beastmaster",
			"aliases": ["mutant", "mutated"],
			"delay": 300,
			"func": async function(m,a) {
					var j = ['beastmaster'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 95,
					  money: Math.floor(Math.random() * 500000000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Beast Master", `You fire up your incubator but fail the session.. You call yourself a \`${output.job}\` ? :thinking:`);
						return;
					}

				cs.success(m, "Beast Master", `You fire up your incubator and hear a :boom:.. Finally a \`${output.job}\` who knows what they are doing! You sell the beast for :money_with_wings: ${cs.formatter.format(output.earned)}`);
			}
		},
		{
			"cmd": "luck",
			"aliases": ["rng", "roll"],
			"delay": 300,
			"func": async function(m,a) {
					var j = ['luck'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 85,
					  money: Math.floor(Math.random() * 100000000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "RNGSUS", `Sorry but \`${output.job}\` is not on your side.. Id stay away from the incubators :thumbsdown:`);
						return;
					}

					cs.success(m, "RNGSUS", `\`${output.job}\` is on your side.. You find :money_with_wings: ${cs.formatter.format(output.earned)}, Now is the time to try that experiment!`);
			}
		},
		{
			"cmd": "help",
			"aliases": ["info", "commands"],
			"delay": 30,
			"func": async function(m,a) {
					var j = ['help'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 0,
					  money: Math.floor(Math.random() * 0),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Commands", `The bot uses ! as a prefix, the commands are: beastmaster, forage, enzyme, dna, vendor, duel, flip, roll, roulette, balance, give, deposit, withdraw, leaderboard, luck, expertise.`);
						return;
					}

					cs.success(m, "Commands", `The bot uses ! as a prefix, the commands are: beastmaster, forage, enzyme, dna, vendor, duel, flip, roll, roulette, balance, give, deposit, withdraw, leaderboard, luck, expertise.`);
			}
		},
		{
			"cmd": "expertise",
			"aliases": ["calc", "exp"],
			"delay": 30,
			"func": async function(m,a) {
					var j = ['expertise'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 0,
					  money: Math.floor(Math.random() * 0),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Expertise Calculator", `http://www.oekevo.org/expertisecalculator/`);
						return;
					}

					cs.success(m, "Expertise Calculator", `http://www.oekevo.org/expertisecalculator/`);
			}
		},
		{
			"cmd": "forage",
			"aliases": ["lyase", "11point"],
			"delay": 60,
			"func": async function(m,a) {
					var j = ['forage'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 70,
					  money: Math.floor(Math.random() * 1000000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Beast Master", `You begin to \`${output.job}\` but are killed by a forage worm! :skull:`);
						return;
					}

				cs.success(m, "Beast Master", `You begin to \`${output.job}\` and find an 11 point lyase! You sell the lyase for :money_with_wings: ${cs.formatter.format(output.earned)}`);
			}
		},
		{
			"cmd": "enzyme",
			"aliases": ["krayt", "hydro"],
			"delay": 60,
			"func": async function(m,a) {
					var j = ['enzyme'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 35,
					  money: Math.floor(Math.random() * 400000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Beast Master", `You extract an \`${output.job}\` but its not worth keeping.. Try a higher level creature! :smirk:`);
						return;
					}

				cs.success(m, "Beast Master", `You extract a 7+ purity \`${output.job}\` and sell it for :money_with_wings: ${cs.formatter.format(output.earned)}`);
			}
		},
		{
			"cmd": "dna",
			"aliases": ["extract", "sample"],
			"delay": 60,
			"func": async function(m,a) {
					var j = ['dna'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 20,
					  money: Math.floor(Math.random() * 250000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Beast Master", `You failed to get a usable \`${output.job}\` sample.. :expressionless:`);
						return;
					}

				cs.success(m, "Beast Master", `You extracted a high quality \`${output.job}\` sample! You sell the sample for :money_with_wings: ${cs.formatter.format(output.earned)}`);
			}
		},
		{
			"cmd": "vendor",
			"aliases": ["sale", "merchant"],
			"delay": 300,
			"func": async function(m,a) {
					var j = ['vendor'];
					var output = await eco.Work(m.author.id, {
					  failurerate: 25,
					  money: Math.floor(Math.random() * 1000000),
					  jobs: j
					})
					if (output.earned == 0) {
						cs.fail(m, "Merchant", `You check your \`${output.job}\` but nothing has sold. :frowning:`);
						return;
					}

				cs.success(m, "Merchant", `You check your \`${output.job}\` and notice several items are no longer listed.. You made :money_with_wings: ${cs.formatter.format(output.earned)}`);
			}
		},
		{
			"cmd": "duel",
			"aliases": ["pvp", "1v1"],
			"delay": 60,
			"func": async function(m,a) {
				var user = m.mentions.users.first()
			 
				if (!user) {
					cs.error(m, 'Please specify the user you want to duel.');
					return;
				}
				if (user == m.author) {
					cs.error(m, 'Are you really trying to duel yourself?');
					return;
				}
				if (cs.probability(0.5)) {
					eco.FetchBalance(user.id).then(async (out) => {
						var bal = parseInt(out.wallet);
						if (bal <= 0) {
							cs.error(m, `<@${user.id}> has no money to put up for the fight.`);
							return;
						}
						bal = Math.floor(bal / (Math.floor(Math.random()*3)));
						
						if (bal <= 0 || bal == Infinity) {
							bal = Math.floor(Math.random()*10000);
						}
						var o = await eco.Transfer(user.id, m.author.id, bal).catch(console.error);
						cs.success(m, "PvP", `You won the fight and win ${cs.formatter.format(bal)} from <@${user.id}>!`);
					});
				} else {
					eco.FetchBalance(m.author.id).then(async (out) => {
						var bal = out.wallet;
						bal = bal * 0.75;
						if (bal == 0) bal = Math.floor(Math.random()*1000)*1;
						var o = await eco.SubstractFromBalance(out.userid, bal).catch(console.error);
						cs.fail(m, "PvP", `You lost the fight to <@${user.id}> and lost ${cs.formatter.format(bal)}!`);
					});
				}
			}
		},
		{
			"cmd": "flip",
			"aliases": ["cf", "coinflip"],
			"delay": 30,
			"func": async function(m,a) {
				var flip = a[0];
				
				if (!flip || flip.toLowerCase() != 'heads' && flip.toLowerCase() != 'tails') {
					cs.error(m, 'Flip heads or tails!');
					return;
				}
				
				var amount = await cs.checkBalance("flip",m,a[1]);
				if (amount){

					var o = await eco.Coinflip(m.author.id, flip, amount).catch(console.error)
					var msg = `Result: ${(o.output == 'won' ? 'You won!' : 'You lost :frowning:')}
					Old balance: ${cs.formatter.format(o.oldbalance)}
					New balance: ${cs.formatter.format(o.newbalance)}`;
					(o.output == 'won' ? cs.success(m, "Coin Flip", msg) : cs.fail(m, "Coin Flip", msg));
				}
			}
		},
		{
			"cmd": "roll",
			"aliases": ["dice"],
			"func": async function(m,a) {
				var roll = a[0];
				if (!roll || ![1, 2, 3, 4, 5, 6].includes(parseInt(roll))) {
					cs.error(m, 'Please specify a number 1-6 to roll.');
					return;
				}
				var amount = await cs.checkBalance("roll",m,a[1]);
				if (amount){
					var gamble = await eco.Dice(m.author.id, roll, amount).catch(console.error)
					var res = `Result: ${gamble.dice}\n${(gamble.output == 'lost' ? 'You lost :frowning:' : 'You won!')}\nOld balance: ${cs.formatter.format(gamble.oldbalance)}\nNew balance: ${cs.formatter.format(gamble.newbalance)}`;
					(gamble.output == 'won' ? cs.success(m, "Dice", res) : cs.fail(m, "Dice", res));
				}
			}
		},
		{
			"cmd": "roulette",
			"delays": 60,
			"func": async function(m,a) {
				var type = a[0];
				if (type) type = type.toLowerCase();
				if (!type || (type != 'even' && type != 'odd' && !cs.isNumber(type))) {
					cs.error(m, 'Please specify even/odd/a number 1-36.');
					return;
				}
				var amount = await cs.checkBalance("bet",m,a[1]);
				if (amount){
					var gamble = await eco.Roulette(m.author.id, type, amount).catch(console.error)
					var res = `Result: ${gamble.roulette}\n${(gamble.output == 'lost' ? 'You lost!' : 'You won!')}\nOld balance: ${cs.formatter.format(gamble.oldbalance)}\nNew balance: ${cs.formatter.format(gamble.newbalance)}`;
					(gamble.output == 'won' ? cs.success(m, "Roulette", res) : cs.fail(m, "Roulette", res));
				}
			}
		}, 
		{
			"cmd": "balance",
			"aliases": ["bal", "money"],
			"func": async function(m,a) {
				if (m.mentions.users.first()) {
					var output = await eco.FetchBalance(m.mentions.users.first().id)
					cs.success(m, "Balance of "+m.mentions.users.first().tag, `Wallet: ${cs.formatter.format(output.wallet)}\nBank: ${cs.formatter.format(output.bank)}`);
				} else {
					var output = await eco.FetchBalance(m.author.id)
					cs.success(m, "Balance", `Wallet: ${cs.formatter.format(output.wallet)}\nBank: ${cs.formatter.format(output.bank)}`);
				}
			}
		},
		{
			"cmd": "give",
			"aliases": ["transfer", "pay"],
			"func": async function(m,a) {
				var user = m.mentions.users.first()
				if (!user) {
					cs.error(m, 'Please specify the user you want to give money to.');
					return;
				}
				if (user == m.author) {
					cs.error(m, 'Cannot pay yourself.');
					return;
				}
				var amount = await cs.checkBalance("give",m,a[1]);
				if (amount){
					var transfer = await eco.Transfer(m.author.id, user.id, amount);
					cs.success(m, "Give Money", `${m.author.tag} gave ${user.tag} ${cs.formatter.format(amount)}.`);
				}
			}
		},
		{
			"cmd": "deposit",
			"aliases": ["dep"],
			"func": async function(m,a) {
				var amount = await cs.checkBalance("deposit",m,a[0]);
				if (amount){
					var transfer = await eco.TransferToBank(m.author.id, amount)
					cs.success(m, "Deposit Money", `Transferred ${cs.formatter.format(amount)} to your bank.`);
				}
			}
		},
		{
			"cmd": "withdraw",
			"aliases": ["with"],
			"func": async function(m,a) {
				var amount = await cs.checkBalance("withdraw",m,a[0]);
				if (amount){
					var transfer = await eco.TransferToWallet(m.author.id, amount)
					cs.success(m, "Withdraw Money", `Transferred ${cs.formatter.format(amount)} to your wallet.`);
				}
			}
		},
		{
			"cmd": "leaderboard",
			"aliases": ["lb"],
			"func": async function(m,a) {
				
					eco.Leaderboard({
						limit: 10
					}).then(async users => { 
						var lb = "";
						for (var i = 0; i < 10; i++) {
							var user = undefined;
							if (users[i])
								user = await client.fetchUser(users[i].userid);
							lb += `${(i+1)}. ${user && '<@'+user.id+'>' || 'None'} - ${users[i] && cs.formatter.format(users[i].total) || '$0'}\n`;
						}

						cs.success(m, "Leaderboard (Top 10)", lb);
					})
			}
		},
		{
			"cmd": "reset",
			"func": async function(m,a) {
				if(m.member.roles.some(r=>["Bot Perms"].includes(r.name)) ) {
					eco.ResetAllUsers(null);
					cs.success(m, "Reset", "Economy has been reset.");
				} else {
					cs.error(m, "You do not have enough permission to do this.");
				}
			}
		},
		{
			"cmd": "resetdelays",
			"func": async function(m,a) {
				if(m.member.roles.some(r=>["Bot Perms"].includes(r.name)) ) {
					var user = m.mentions.users.first()
					if (user) {
						for (var i = 0; i < this.delays.length; i++) {
							if (this.delays[i].uid == user.id) {
								this.delays.slice(i);
							}
						}
					} else {
						this.delays = [];
					}
					cs.success(m, "Reset Delays", `Command delays have been reset${user ? ' for ' + user.tag : ''}.`);
				} else {
					cs.error(m, "You do not have enough permission to do this.");
				}
			}
		}
	];
	
	client.on('message', msg => {
		var m = msg.content.toLowerCase();
		if (m.charAt(0) == config.botPrefix && msg.channel.id == 600250348984205340) {
			let cmd = m.slice(config.botPrefix.length).split(' ')[0];
			let args = m.split(' ').slice(1);
			for(var i = 0; i < this.casinoCommands.length; i++) {
				if (this.casinoCommands[i]['cmd'] == cmd || (this.casinoCommands[i]['aliases'] ? this.casinoCommands[i]['aliases'].indexOf(cmd) !== -1 : false)) {
					console.log(`CMD -> ${msg.author.tag} executed command ${config.botPrefix}${cmd} in \#${msg.channel.name}`);
					if (this.casinoCommands[i]['delay']) {
						var d = this.delay(msg, this.casinoCommands[i]['cmd'], this.casinoCommands[i]['delay']);
						if (d) this.casinoCommands[i]['func'](msg, args)
					} else {
						this.casinoCommands[i]['func'](msg, args);
					}
				}
			}
		}
	});

client.login(process.env.BOT_TOKEN);
