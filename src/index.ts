import { registerCommand, runCommand} from "./config";
import { handlerAggregator, handlerLogin, handlerRegister, handlerReset, handlerUsers, handlerFeed } from "./commands";
import type { CommandsRegistry } from "./types";
import process from "node:process";



async function main() {
  try {
    console.log("Hello, world!");
    const commandsRegistry: CommandsRegistry = {};
    await registerCommand(commandsRegistry, "login", handlerLogin);
    await registerCommand(commandsRegistry, "register", handlerRegister);
    await registerCommand(commandsRegistry, "reset", handlerReset);
    await registerCommand(commandsRegistry, "users", handlerUsers);
    await registerCommand(commandsRegistry, "agg", handlerAggregator);
    await registerCommand(commandsRegistry, "addfeed", handlerFeed);
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
