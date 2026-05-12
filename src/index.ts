import { runCommand} from "./config";
import { handlerAggregator, handlerLogin, handlerRegister, handlerReset, handlerUsers, handlerFeed, handlerfeeds, handlerFollow, getFeedFollowsForUser } from "./commands";
import type { CommandsRegistry } from "./types";
import process from "node:process";



async function main() {
  try {
    
    const commandsRegistry: CommandsRegistry = {
      "login": handlerLogin,
      "register": handlerRegister,
      "reset": handlerReset,
      "users": handlerUsers,
      "agg": handlerAggregator,
      "addfeed": handlerFeed,
      "feeds": handlerfeeds,
      "follow": handlerFollow,
      "following": getFeedFollowsForUser,
      
    };

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
