const config = require('./config.json');
var schedule = require('node-schedule');
const Discord = require('discord.js');
const util = require('util');

//Courses
//var eng111 = require('./eng111.json');
//var eng115 = require('./eng115.json');
//var eng121 = require('./eng121.json');
//var eng140 = require('./eng140.json');

var userdata = require('./userdata.json');
let fs = require('fs');
var now = new Date();
var cron = require('node-cron');
const h2p = require('html2plaintext')

let Parser = require('rss-parser');
let parser = new Parser();
 
async function all(){
	await feed("CHEMMAT 121");
	await feed("ELECTENG 101");
	await feed("ENGGEN 115");
	await feed("ENGGEN 131");
}
async function feed(course){
	let pos = config.feed.map(function (test) {return test.name; }).indexOf(course);
	let feed = await parser.parseURL(config.feed[pos].rss);
	let pos2 = config.studychannels.map(function (test) {return test.name; }).indexOf(course);
	let channel = config.studychannels[pos2].id;
	let pos3 = config.courseroleid.map(function (test) {return test.name; }).indexOf(course);
	let courseroleid = config.courseroleid[pos3].id;
	let pos4 = config.lastfeed.map(function (test) {return test.name; }).indexOf(course);
	let lastfeed = config.lastfeed[pos4].rss;
	for(let i = 0; i<feed.items.length; i++)
	{
		if(feed.items[i].title !== lastfeed ){
			let content = h2p(feed.items[i].content);
			if (content.length > 1500){
				content = content.slice(0,1500) + "\n\nContent is too long please read Online";
			}
			let msg = "<@&"+courseroleid+"> "+ feed.items[i].title + "```" + content + "```" + feed.items[i].link;
			console.log(msg);
			bot.channels.get("566569326648229908").send(String(msg));
		}else{
			i = feed.items.length;
		}
	}
	config.lastfeed[pos4].rss = feed.items[0].title;
	write(config,"config");
}

var defaultreporttype = "B";

const bot = new Discord.Client({
    disableEveryone: true,
    disabledEvents: ['TYPING_START']
});
var offset;


cron.schedule("0 0 * * * *", function(){
	now = new Date();
	console.log("1 Hour passed " + now.toJSON());
    console.info('cron job completed');
	all();
	
});    

bot.on("ready", () => {
	all();
    bot.user.setGame('with Cool Franco'); //you can set a default game
    console.log(`Bot is online!\n${bot.users.size} users, in ${bot.guilds.size} servers connected.`);
	var datestring;
	var mydate = new Date(datestring);
	console.log(mydate.toDateString());
	
});

bot.on("guildCreate", guild => {
    console.log(`I've joined the guild ${guild.name} (${guild.id}), owned by ${guild.owner.user.username} (${guild.owner.user.id}).`);
});

function evalCmd(message, code) {
    if(message.author.id !== config.owner) return;
    try {
        let evaled = eval(code);
        if (typeof evaled !== "string")
            evaled = util.inspect(evaled);
            message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}
function clean(text) {
    if (typeof(text) !== 'string') {
        text = util.inspect(text, { depth: 0 });
    }
    text = text
        .replace(/`/g, '`' + String.fromCharCode(8203))
        .replace(/@/g, '@' + String.fromCharCode(8203))
        .replace(config.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0') //Don't let it post your token
    return text;
}


function write(data,name){
	fs.writeFile ("./"+name+".json", JSON.stringify(data, null, 4), function(err) {
		if (err) throw err;
		console.log('complete writing data to '+name);
		}
	);
}

function space(str, numspace)
{
    var emptySpace = "";
	var space = numspace-str.length;
    for (i = 0; i < space; i++){
        emptySpace += " ";
    }
	if (str.length > numspace){
		str.length = numspace;
	}
    var output = str + emptySpace;
    return output;
}


// Catch Errors before they crash the app.
process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
    // process.exit(1); //Eh, should be fine, but maybe handle this?
});

bot.login(config.token);