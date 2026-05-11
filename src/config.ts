import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import "dotenv/config"
import process from "node:process";
import { createUser, getUser, resetDb, getUsers } from "./lib/db/queries/users";
import {XMLParser} from "fast-xml-parser";
import { title } from "node:process";

const connection = process.env.DATABASE_URL;


export type Config = {
	dbUrl : string;
	currentUserName: string;
}

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};


type CommandHandler = (cmdName: string, ... args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>



export async function handlerAggregator(cmdName: string, ...args: string[]) {
	const response = await fetchFeed("https://www.wagslane.dev/index.xml");
	console.log(response);
}


export async function handlerUsers(cmdName: string, ...args: string[]) {
	const result = await getUsers();
	const config = readConfig();
	if (result) {
		result.forEach(item => {
			//is current will be the current user who is logged in
			const isCurrent = item.name === config.currentUserName;
			//display name is set to * name if iscurrent is false otherwise prints the current to console
			const displayName = isCurrent ? `* ${item.name} (current)` : `* ${item.name}`;
			console.log(displayName); 
		});
	} else {
		throw new Error(`fetching users from db failed`);
	}
}




export async function handlerLogin(cmdName: string, ...args: string[]) {
	if (!args || args.length === 0) {
		throw new Error(`No args provided i.e. no username provided \n Command usage:- npm run start login <user-name>`);
	}
	const userCheck = await getUser(args[0]);
	if (userCheck) {
		setUser(args[0]);
		console.log(`User was set in config- ${args[0]}`);
	} else {
		throw new Error(`User doesn't exist in database`)	
	}
}


export async function handlerRegister(cmdName: string, ...args: string[]){
	if (!args || args.length === 0) {
		throw new Error(`No name provided \n Command usage:- npm run start register <name>`)
	}
	const userCheck = await getUser(args[0]);

	if (userCheck) {
		throw new Error(`User already exists`)
	} else {
		const dataDb = await createUser(args[0]);
		console.log(`User was created`)
		console.log(dataDb);
		setUser(args[0]);
		console.log(`User was set in config`);
	}
}

export async function handlerReset(cmdName: string, ...args: string[]) {
	const result = await resetDb();
	if (result) {
		console.log(`Database entries were deleted`);
	} else {
		throw new Error(`Database entries were not deleted`);
	}
}


export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
	registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
	const handler = registry[cmdName];
	await handler(cmdName, ...args);
}



function setUser(name: string) {
	const configPath = getConfigFilePath();
	const rawData = fs.readFileSync(configPath, 'utf-8');
	const data = JSON.parse(rawData);
	if (data.dbUrl) {
		const newConfig = {dbUrl: data.dbUrl, currentUserName: name};
		writeConfig(newConfig);
	} else {
		const newConfig = {dbUrl: connection, currentUserName: name};
		writeConfig(newConfig);
	}	
}

export function readConfig():Config{
	const configPath = getConfigFilePath();
	const rawData = fs.readFileSync(configPath, 'utf-8');
	const data = JSON.parse(rawData);
	if (validateConfig(data)) {
		const newConfig = {dbUrl: data.dbUrl, currentUserName: data.currentUserName};
		return newConfig;
	} else {
		throw new Error("invalid Config data");
	}
}


function getConfigFilePath():string {
	const homedir = os.homedir();
	const configPath = path.join(homedir, '.gatorconfig.json');
	return configPath;
}



function writeConfig(cfg: Config):void {
	const configPath = getConfigFilePath();
	const data  = JSON.stringify(cfg);
	fs.writeFileSync(configPath, data);
}

//validating whether the config is the type we want
function validateConfig(rawConfig: any):rawConfig is Config {
	if (typeof rawConfig !== "object" || rawConfig === null) {
		throw new Error(`Config is not a object or config is null\n Config:- \n ${rawConfig}`);
	}
	if (typeof rawConfig.dbUrl !== "string" || typeof rawConfig.currentUserName !== "string") {
		throw new Error(`dbUrl or currentUserName is not string \n Config:- \n ${rawConfig}`);
	}
	if (!rawConfig.dbUrl.startsWith('postgres://')) {
		throw new Error(`dbUrl a valid postgres link \n dbUrl:- \n ${rawConfig.dbUrl}`);
	}
	return true;
}




async function fetchFeed(feedURL: string) {
	const response = await fetch(feedURL, {
		method: "GET",
		mode: "cors",
		headers: {
			"Accept": "application/xml",
			"User-Agent": "gator_gp" 
		}
	});

	const respTxt = await response.text();
	const parser = new XMLParser({processEntities: false});
	const jsonObj = parser.parse(respTxt);
	let titleC, linkC, descriptionC = "";
	let items:RSSItem[] = [];

	if (jsonObj.rss.channel) {
		titleC = jsonObj.rss.channel.title;
		linkC = jsonObj.rss.channel.link;
		descriptionC = jsonObj.rss.channel.description;
		
		if (jsonObj.rss.channel.item){
			if (Array.isArray(jsonObj.rss.channel.item)){
				jsonObj.rss.channel.item.forEach((item) => {
					if (item.title && item.link && item.description && item.pubDate) {
						const {guid, ...rest} = item;
						items.push(rest)
					}
				})
			} else {
				items = jsonObj.rss.channel.item;
			}
		}

	} else {
		throw new Error(`No channel in jsonObj`)
	}

	const feed: RSSFeed = {channel: 
		{title: titleC,
			link: linkC,
			description: descriptionC,
			item: items
	 	}
	};

	return feed;
}