import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import "dotenv/config"
import process from "node:process";

import type { Config, CommandHandler, CommandsRegistry } from "./types";



const connection = process.env.DATABASE_URL;



export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
	registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
	const handler = registry[cmdName];
	
	await handler(cmdName, ...args);
}



export function setUser(name: string) {
	const configPath = getConfigFilePath();
	const rawData = fs.readFileSync(configPath, 'utf-8');
	const data = JSON.parse(rawData);
	if (data.dbUrl) {
		const newConfig = {dbUrl: data.dbUrl, currentUserName: name};
		writeConfig(newConfig);
	} else {
		const newConfig = {dbUrl: connection, currentUserName: name};
		writeConfig(newConfig);
	}	
}

export function readConfig():Config{
	const configPath = getConfigFilePath();
	const rawData = fs.readFileSync(configPath, 'utf-8');
	const data = JSON.parse(rawData);
	if (validateConfig(data)) {
		const newConfig = {dbUrl: data.dbUrl, currentUserName: data.currentUserName};
		return newConfig;
	} else {
		throw new Error("invalid Config data");
	}
}


function getConfigFilePath():string {
	const homedir = os.homedir();
	const configPath = path.join(homedir, '.gatorconfig.json');
	return configPath;
}



function writeConfig(cfg: Config):void {
	const configPath = getConfigFilePath();
	const data  = JSON.stringify(cfg);
	fs.writeFileSync(configPath, data);
}

//validating whether the config is the type we want
function validateConfig(rawConfig: any):rawConfig is Config {
	if (typeof rawConfig !== "object" || rawConfig === null) {
		throw new Error(`Config is not a object or config is null\n Config:- \n ${rawConfig}`);
	}
	if (typeof rawConfig.dbUrl !== "string" || typeof rawConfig.currentUserName !== "string") {
		throw new Error(`dbUrl or currentUserName is not string \n Config:- \n ${rawConfig}`);
	}
	if (!rawConfig.dbUrl.startsWith('postgres://')) {
		throw new Error(`dbUrl a valid postgres link \n dbUrl:- \n ${rawConfig.dbUrl}`);
	}
	return true;
}




