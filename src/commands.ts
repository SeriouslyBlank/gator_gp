import { createUser, getUser, resetDb, getUsers } from "./lib/db/queries/users";
import {XMLParser} from "fast-xml-parser";
import { readConfig, setUser } from "./config"; 
import type {Feed, RSSFeed, RSSItem, User} from "./types";

import { createFeed } from "./lib/db/queries/feeds";


export async function handlerFeed(cmdName: string, ...args: string[]) {
	if (!args[0] || !args[1]) {
		throw new Error(`Feed name or url not provided \n Command usage:- addFeed <Feed-name> <link-to-feed>`);
	}
	await addFeed(args[0], args[1]);

}



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
				jsonObj.rss.channel.item.forEach((item : RSSItem & {guid: string;}) => {
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


async function addFeed(name: string, url: string){
	const config = readConfig();
	const result = await createFeed(name, url, config.currentUserName);
	console.log(result)

}


function printFeed(feed: Feed, user: User) {
	console.log(`Feed ${feed}`)
	console.log(`user ${user}`)
}