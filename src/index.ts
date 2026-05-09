import { registerCommand, runCommand, handlerLogin } from "./config";
import process from "node:process";



function main() {
  console.log("Hello, world!");
  const commandsRegistry = {};
  registerCommand(commandsRegistry, "login", handlerLogin);
  const [cmd, ...args] = process.argv.slice(2);
  runCommand(commandsRegistry, cmd, ...args)
}

main();
