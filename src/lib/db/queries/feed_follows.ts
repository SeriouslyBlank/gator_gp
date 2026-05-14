import { db } from "..";
import { feeds, users, feed_follows} from "../schema";
import { eq, lt, gte, ne, and } from 'drizzle-orm';



export async function insertFeedFollow(u_id:string, f_id: string) {
	const [newFeedFollow] = await db.insert(feed_follows).values({user_id: u_id,feed_id: f_id }).onConflictDoNothing({target: [feed_follows.user_id, feed_follows.feed_id]}).returning();
	if (!newFeedFollow) {
		return `You are already following that feed`
	} else {
		const result = await getFeedFollows(newFeedFollow.id);
		return result;
	}
}


export async function getFeedFollows(id?: string){
	if (id) {
		const result = await db.select({
			id: feed_follows.id,
			createdAt: feed_follows.createdAt, 
			updatedAt: feed_follows.updatedAt,
			feed_name: feeds.name,
			user_name: users.name,
		}).from(feed_follows).innerJoin(feeds, eq(feeds.id, feed_follows.feed_id)).innerJoin(users, eq(users.id, feed_follows.user_id)).where(eq(feed_follows.id, id));
		return result
	} else {
		const result = await db.select({
			id: feed_follows.id,
			createdAt: feed_follows.createdAt, 
			updatedAt: feed_follows.updatedAt,
			feed_name: feeds.name,
			user_name: users.name,
		}).from(feed_follows).innerJoin(feeds, eq(feeds.id, feed_follows.feed_id)).innerJoin(users, eq(users.id, feed_follows.user_id));
		return result;
	}
}

export async function feedFollowingForUser(id:string) {
	const result = await db.select({
		id: feed_follows.id,
		createdAt: feed_follows.createdAt, 
		updatedAt: feed_follows.updatedAt,
		feed_name: feeds.name,
		user_name: users.name,
	}).from(feed_follows).innerJoin(feeds, eq(feeds.id, feed_follows.feed_id)).innerJoin(users, eq(users.id, feed_follows.user_id)).where(eq(feed_follows.user_id, id));
	return result
}

export async function feedUnfollow(feed_id:string, user_id:string) {
	const result = await db.delete(feed_follows).where(and(eq(feed_follows.feed_id, feed_id), eq(feed_follows.user_id, user_id))).returning();
	return result;

}
