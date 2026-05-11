import { registerCommand, runCommand, handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./config";
import type {CommandsRegistry} from "./config"
import process from "node:process";



async function main() {
  try {
    console.log("Hello, world!");
    const commandsRegistry: CommandsRegistry = {};
    await registerCommand(commandsRegistry, "login", handlerLogin);
    await registerCommand(commandsRegistry, "register", handlerRegister);
    await registerCommand(commandsRegistry, "reset", handlerReset);
    await registerCommand(commandsRegistry, "users", handlerUsers);
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
