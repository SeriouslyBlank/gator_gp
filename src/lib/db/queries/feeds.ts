import { db } from "..";
import { feeds} from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';
import { getUser } from "./users";




export async function createFeed(name: string, url: string, user_name: string) {
	const u_db = await getUser(user_name);
	const [result] = await db.insert(feeds).values({name: name, url: url, user_id: u_db.id}).returning();
	return result;
}

