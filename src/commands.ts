import { createUser, getUser, resetDb, getUsers } from "./lib/db/queries/users";
import {XMLParser} from "fast-xml-parser";
import { readConfig, setUser } from "./config"; 
import type {Feed, RSSFeed, RSSItem, User} from "./types";
import { createFeed, getNextFeedToFetch, markFeedFetched, selectFeeds } from "./lib/db/queries/feeds";
import { feedFollowingForUser, feedUnfollow, insertFeedFollow } from "./lib/db/queries/feed_follows";
import process from "node:process";






export async function handlerAggregator(cmdName: string, ...args: string[]) {
	if (!args || args.length === 0) {
		throw new Error(`Valid time between request not provided- ${args} \n Command Usage-  agg  <time-between-request-in-ms/s/m/h>`)
	}

	const time_between_reqs =  parseDuration(args[0])

	await scrapeFeeds().catch((error)=>{console.error(error)});
	const interval = setInterval(async ()=> {
		await scrapeFeeds().catch((error)=>{console.error(error)});
	}, time_between_reqs)

	await new Promise<void>((resolve) => {
		process.on("SIGINT", () => {
			console.log("Shutting down feed aggregator...");
			clearInterval(interval);
			resolve();
		});
	});
}




function parseDuration(durationStr: string)  {
	const regex = /^(\d+)(ms|s|m|h)$/;
	const match = durationStr.match(regex);
	if (!match){
		throw new Error(`valid time not provided,\n Valid Time- ms, s, m, h`)
	}
	const time = match[1];
	const unit = match[2];

	switch(unit) {
		case "ms":
			console.log(`Collecting feeds every ${time}ms`);
			return Number(time);
		case "s":
			console.log(`Collecting feeds every ${time}s`);
			return Number(time)*1000;
		case "m":
			console.log(`Collecting feeds every ${time}m0s`);
			return Number(time)*1000*60;
		case "h":
			console.log(`Collecting feeds every ${time}hr0m0s`);
			return Number(time)*1000*60*60;
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

	

	if (!response.ok) {
		console.log("ehh()")
		throw new Error(`Failed to fetch the feed: ${response.status} ${response.statusText}`);
	}

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


export async function scrapeFeeds(){
	const [nextFeed] = await getNextFeedToFetch();
	const feed = await fetchFeed(nextFeed.url);
	feed.channel.item.forEach((item)=>{
		console.log(`* ${item.title}`)
	});
	await markFeedFetched(nextFeed.id);
	

}




export async function handlerUsers(cmdName: string, ...args: string[]) {
	const result = await getUsers();
	const config = readConfig();
	if (result && result.length > 0) {
		result.forEach(item => {
			//is current will be the current user who is logged in
			const isCurrent = item.name === config.currentUserName;
			//display name is set to * name if iscurrent is false otherwise prints the current to console
			const displayName = isCurrent ? `* ${item.name} (current)` : `* ${item.name}`;
			console.log(displayName); 
		});
	} else if(result.length === 0) {
		console.log(`No entries in users table`)
	} else {
		throw new Error(`fetching users from db failed`);
	}
}




export async function handlerLogin(cmdName: string, ...args: string[]) {
	if (!args || args.length === 0) {
		throw new Error(`No args provided i.e. no username provided \n Command usage:- npm run start login <user-name>`);
	}

	const userCheck = await getUser(args[0]);
	if (!(userCheck.length === 0)) {
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
	
	const [userCheck] = await getUser(args[0]);
	if (userCheck) {
		throw new Error(`User ${args[0]} already exists`)
	} else {
		const dataDb = await createUser(args[0]);
		console.log(`User ${args[0]} was registered`)
		setUser(args[0]);
		console.log(`User ${args[0]} was set in config`);
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






export async function handlerFeed(cmdName: string, user: {id: string, createdAt:Date, updatedAt: Date, name: string},...args: string[]) {
	if (!args[0] || !args[1]) {
		throw new Error(`Feed name or url not provided \n Command usage:- addFeed <Feed-name> <link-to-feed>`);
	}
	await addFeed(args[0],user, args[1]);
}


async function addFeed(name: string,  user: {id: string, createdAt:Date, updatedAt: Date, name: string}, url:string){
	const result = await createFeed(name, user, url);
	console.log(result)
	await handlerFollow("follow",user, url);

}


function printFeed(feed: Feed, user: User) {
	console.log(`Feed name:- ${feed.name}`)
	console.log(`Feed link:- ${feed.url}`)
	console.log(`Feed added by user:- ${user.name}`)
}

export async function handlerfeeds(cmdName: string, ...args: string[]){
	const result = await selectFeeds();
	if (result.length === 0) {
		console.log(`No entries in feeds table`)
	} else {
		//since the sql function was modified the return type can be different depending on whether the url was provided or not, data will be of the {users, feeds} so just gonnna any to ignore lsp
		result.forEach((item:any)=>{
			const {users, feeds} = item;
			printFeed(feeds, users);
		});
	}
		
}


async function createFeedFollow(user_id: string, feed_id: string) {
	const result = await insertFeedFollow(user_id, feed_id);
	if (Array.isArray(result)){
		console.log(`Following feed ${result[0].feed_name}`);
		console.log(`For the user ${result[0].user_name}`);
	} else {
		console.log(result);
	}
}



export async function handlerFollow(cmdName: string, user: {id: string, createdAt:Date, updatedAt: Date, name: string},...args: string[]) {
	if (!args[0] || args[0].length ===0) {
		throw new Error(`url not provided \n Command Usage:- follow <feed-url>`)
	}
	const [feeds] = await selectFeeds(args[0]);
	if (!feeds) {
		throw new Error(`Feed not in Feeds table, use command addFeed to add \n addFeed auto adds the feed to follow feed as welll`)
	} else {
		// since feeds can be a joined result or just the feeds
		if (!("users" in feeds)){
			await createFeedFollow(user.id, feeds.id);
		}
	}
}


export async function handlerFollowing(cmdName: string, user: {id: string, createdAt:Date, updatedAt: Date, name: string},...args: string[]) {
	const result = await feedFollowingForUser(user.id);
	if (result.length === 0) {
		console.log(`User is not following any feed`)
	}else {
		console.log(`Currently following feeds for the user-${user.name}`)
		result.forEach((item)=> {
			console.log(`${item.feed_name}`)
		});
	}		
}

export async function handlerUnFollowing(cmdName: string, user: {id: string, createdAt:Date, updatedAt: Date, name: string},...args: string[]) {
	if (!args[0] || args[0].length === 0) {
		throw new Error(`No feed url provided \n Command usage:- following <feed-url>`)
	}
	const [feeds] =await selectFeeds(args[0]);
	if (!feeds || "users" in feeds){
		throw new Error(`Incorrect feed-url \n Check using the command feeds`)
	}
	const [result] = await feedUnfollow(feeds.id, user.id);
	console.log(result)
	if (!result) {
		console.log(`User ${user.name} is not following feed- ${args[0]} \nTo check current following use command- following`)
	} else {
		console.log(`Not following ${args[0]} anymore`)
	}
}

