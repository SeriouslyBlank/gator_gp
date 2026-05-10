import { registerCommand, runCommand, handlerLogin, handlerRegister } from "./config";
import type {CommandsRegistry} from "./config"
import process from "node:process";



async function main() {
  console.log("Hello, world!");
  const commandsRegistry: CommandsRegistry = {};
  await registerCommand(commandsRegistry, "login", handlerLogin);
  await registerCommand(commandsRegistry, "register", handlerRegister);
  const [cmd, ...args] = process.argv.slice(2);
  if (commandsRegistry[cmd]) {
    await runCommand(commandsRegistry, cmd, ...args)
  } else {
    console.error(`Command not found ${cmd}`)
    process.exit(1);
  }
  
}

main();
