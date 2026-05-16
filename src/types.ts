import { feeds, users } from "./lib/db/schema";


export type Config = {
	dbUrl : string;
	currentUserName: string;
}

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};


export type Unit = "s" | "d" | "ms"  | "m" | "h";

export type Feed = typeof feeds.$inferSelect;

export type User = typeof users.$inferSelect;

export type CommandHandler = (cmdName: string, ... args: string[]) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>


export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;
