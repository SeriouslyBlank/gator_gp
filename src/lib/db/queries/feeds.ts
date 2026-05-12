import { db } from "..";
import { feeds, users} from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';
import { getUser } from "./users";




export async function createFeed(name: string, url: string, user_name: string) {
	const u_db = await getUser(user_name);
	const [newFeed] = await db.insert(feeds).values({name: name, url: url, user_id: u_db.id}).onConflictDoNothing({target: feeds.url}).returning();
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