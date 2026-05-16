import { timestamp } from "drizzle-orm/gel-core";
import { db } from "..";
import { feeds, users} from "../schema";
import { eq, lt, gte, ne, sql, asc } from 'drizzle-orm';



export async function createFeed(name: string, user: {id: string, createdAt:Date, updatedAt: Date, name: string}, url: string, ) {
	const [newFeed] = await db.insert(feeds).values({name: name, url: url, user_id: user.id}).onConflictDoNothing({target: feeds.url}).returning();
	if (!newFeed) {
		return `${url} already in feeds db`
	} else {
		return newFeed;
	}
}


export async function selectFeeds(url?:string){
	if (url) {
		const result = await db.select().from(feeds).where(eq(feeds.url, url));
		return result;
	} else {
		const result = await db.select().from(feeds).innerJoin(users, eq(users.id, feeds.user_id));
		return result;
	}
	
} 

export async function markFeedFetched(feed_id: string) {
	const result = await db.update(feeds).set({last_fetched_at: sql`now()`, updatedAt:  sql`now()`}).where(eq(feeds.id,feed_id)).returning();
	return result;
}


export async function getNextFeedToFetch() {
	const result = await db.select().from(feeds).orderBy(sql`last_fetched ASC NULLS FIRST`).limit(1);
	return result;
}