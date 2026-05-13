import { readConfig} from "./config";
import { getUser } from "./lib/db/queries/users";
import type { CommandHandler, UserCommandHandler, middlewareLoggedIn } from "./types";


export function middlewareLoggedIn(handler: UserCommandHandler):CommandHandler {
	return async (cmdName: string, ...args:string[]) => {
		const config = readConfig();
		const [user] = await getUser(config.currentUserName);
		if (!user) {
			throw new Error(`User ${config.currentUserName} not found \n Register first`)
		}

		return handler(cmdName, user, ...args)
	}
	
}

