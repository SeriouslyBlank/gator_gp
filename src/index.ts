import { runCommand, registerCommand} from "./config";
import { handlerAggregator, handlerLogin, handlerRegister, handlerReset, handlerUsers, handlerFeed, handlerfeeds, handlerFollow, handlerFollowing } from "./commands";
import type { CommandsRegistry } from "./types";
import process from "node:process"
import { middlewareLoggedIn } from "./middleware";



async function main() {
  try {
    
    const commandsRegistry: CommandsRegistry = {
      "login": handlerLogin,//logins in the user, provided that user has already registered
      "register": handlerRegister, //registers the user and login as well
      "reset": handlerReset,
      "users": handlerUsers,
      "agg": handlerAggregator,
      "feeds": handlerfeeds,

    };

    await registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerFeed));
    await registerCommand(commandsRegistry, "follow", middlewareLoggedIn(handlerFollow));
    await registerCommand(commandsRegistry, "following", middlewareLoggedIn(handlerFollowing));



    const [cmd, ...args] = process.argv.slice(2);
    if (!commandsRegistry[cmd]) {
      console.error(`Command not found: ${cmd}`)
      process.exit(1);
    }
    await runCommand(commandsRegistry, cmd, ...args);
    process.exit(0);
  } catch(err) {
    console.error(`Error occured:${err}`);
    process.exit(1);
  }
}

main();
