import { RSSItem } from "src/types";
import { db } from "..";
import { posts} from "../schema";
import { eq, lt, gte, ne, sql, asc, desc } from 'drizzle-orm';



export async function createPost(item: RSSItem, feedid:string) {
	let date : Date;
	if (typeof item.pubDate === "string") {
		date = new Date(item.pubDate)
	} else{
		console.log("this happened")
		console.log(item.pubDate)
		date = item.pubDate
	}

	const result =  await db.insert(posts).values({
		title: item.title,
		url: item.link,
		description: item.description,
		publishedAt: date,
		feed_id: feedid
		}).onConflictDoNothing({target: posts.url}).returning();
	return result;
}


export async function getPostsForUser(feed_id: string, limit_val:number = 2){
	const result = await db.select().from(posts).where(eq(posts.feed_id, feed_id)).orderBy(desc(posts.publishedAt)).limit(limit_val);
	return result;
}

