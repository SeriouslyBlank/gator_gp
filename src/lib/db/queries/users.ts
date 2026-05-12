import { db } from "..";
import { users } from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';


export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
	const [result] = await db.select().from(users).where(eq(users.name,name));
	return result;
}

export async function getUsers() {
	const result = await db.select({name: users.name}).from(users);
	
	return result;
}


export async function resetDb() {
	await db.delete(users);
	return true;
}

export async function getUserName(id:string) {
	const [result] = await db.select({name: users.name}).from(users).where(eq(users.id,id));
	return result;
}