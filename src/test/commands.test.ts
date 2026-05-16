import { it, expect, describe } from 'vitest';
import { exec } from 'node:child_process';
import { readConfig } from '../config';
import { promisify } from 'node:util';

//config checks
console.log("Checking config")
const user = readConfig();
console.log("Valid config")

const execAsync = promisify(exec);

//helper function to run the npm run commands since execsync will just crash if i just use it directly, even though i expected it to fail... anyway
const runCommand = async (cmd:string) => {
	try {
		const {stdout, stderr} = await execAsync(cmd, {encoding: "utf8"});
		return {
			stdout: stdout,
			stderr: stderr,
			error: false
		};
	} catch(e:any) {
		return {
			stdout: e.stdout || "",
			stderr: e.stderr || e.message,
			error: true,
		};
	}
};

//reset command
it('command RESET', async () => {
	const arg = ""
	const cmd = "reset"
	const output = await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain('Database entries were deleted');
});

//middlewarechecks
describe(`Middleware Checks`, ()=> {
	it.concurrent(`ADDFEED`, async () =>{
		const output = await runCommand("npm run start addfeed test_2 url");
		expect(output.stderr).toContain(`${user.currentUserName} not found`)
		expect(output.stderr).toContain('Register first');
		expect(output.stderr).toContain('Error occured:');
		expect(output.error).toBe(true);
	})

	it.concurrent(`FOLLOW`, async () =>{
		const output =await runCommand("npm run start follow test_3 url");
		expect(output.stderr).toContain(`${user.currentUserName} not found`)
		expect(output.stderr).toContain('Register first');
		expect(output.stderr).toContain('Error occured:');
		expect(output.error).toBe(true);
	})

	it.concurrent(`FOLLOWING`, async () =>{
		const output =await runCommand("npm run start following");
		expect(output.stderr).toContain(`${user.currentUserName} not found`)
		expect(output.stderr).toContain('Register first');
		expect(output.stderr).toContain('Error occured:');
		expect(output.error).toBe(true);
	})

	it.concurrent(`UNFOLLOW`, async () =>{
		const output =await runCommand("npm run start unfollow");
		expect(output.stderr).toContain(`${user.currentUserName} not found`)
		expect(output.stderr).toContain('Register first');
		expect(output.stderr).toContain('Error occured:');
		expect(output.error).toBe(true);
	})

});


//register, login, users

it('command REGISTER', async() => {
	const arg = "Blank"
	const cmd = "register"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	const u2 = readConfig();
	expect(output.stdout).toContain(`User ${arg} was registered`)
	expect(output.stdout).toContain(`User ${arg} was set in config`)
	expect(u2.currentUserName).toContain(`${arg}`);
});

it('command REGISTER', async() => {
	const arg = "Blankie"
	const cmd = "register"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	const u2 = readConfig();
	expect(output.stdout).toContain(`User ${arg} was registered`)
	expect(output.stdout).toContain(`User ${arg} was set in config`)
	expect(u2.currentUserName).toContain(`${arg}`);
});

//login
it('command LOGIN', async() => {
	const arg = "Blank"
	const cmd = "login"
	const output = await runCommand(`npm run start ${cmd} ${arg}`);
	const u2 = readConfig();
	expect(output.stdout).toContain(`User was set in config- ${arg}`)
	expect(u2.currentUserName).toContain(`${arg}`);
});

//users
it('command users', async() => {
	const arg = " "
	const cmd = "users"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	const u2 = readConfig();
	expect(output.stdout).toContain(`* ${u2.currentUserName} (current)`)
	expect(output.stdout).toContain(`* Blankie`)
});



//already exists case for register
it('command REGISTER', async() => {
	const arg = "Blankie"
	const cmd = "register"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stderr).toContain(`User ${arg} already exists`)
	expect(output.error).toBe(true);
});



//feeds
it('command FEEDS', async() => {
	const arg = ""
	const cmd = "feeds"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`No entries in feeds table`);
});


//checking addfeed
it.concurrent(`ADDFEED`, async () =>{
	const feed_name = `test_lorem_ipsum`
	const feed_link = `https://lorem-rss.herokuapp.com/feed?unit=year&length=5`
	const arg = `${feed_name} ${feed_link}`
	const cmd = "addfeed"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`Following feed ${feed_name}`)
	expect(output.stdout).toContain(`For the user Blank`)
});

//checking addfeed
it.concurrent(`ADDFEED`, async () =>{
	const feed_name = `feed_name`
	const feed_link = `feed_link`
	const arg = `${feed_name} ${feed_link}`
	const cmd = "addfeed"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`Following feed ${feed_name}`)
	expect(output.stdout).toContain(`For the user Blank`)
});


//checking follow
it(`FOLLOW`, async () =>{
	const feed_name = `feed_name`
	const feed_link = `feed_link`
	const arg = `${feed_link}`
	const cmd = "follow"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`You are already following that feed`)
});


//checking following
it(`FOLLOWING`, async () =>{
	const feed_name = `feed_name`
	const feed_link = `feed_link`
	const arg = ``
	const cmd = "following"
	const user2 = readConfig();
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`Currently following feeds for the user-${user2.currentUserName}`)
});


//checking unfollowing
it(`UNFOLLOW`, async () =>{
	const feed_name = `feed_name`
	const feed_link = `feed_link`
	const arg = `${feed_link}`
	const cmd = "unfollow"
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`Not following ${feed_link} anymore`)
});

//checking unfollowing again
it(`UNFOLLOW`, async () =>{
	const feed_name = `feed_name`
	const feed_link = `feed_link`
	const arg = `${feed_link}`
	const cmd = "unfollow"
	const user2 = readConfig();
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`User ${user2.currentUserName} is not following feed- ${arg}`)
});

/*checking aggregator
it(`AGG`, async () =>{
	const feed_name = `test_lorem_ipsum`
	const feed_link = `https://lorem-rss.herokuapp.com/feed?unit=year&length=5`
	const arg = `10s`
	const cmd = "agg"
	const user2 = readConfig();
	const output =await runCommand(`npm run start ${cmd} ${arg}`);
	expect(output.stdout).toContain(`Collecting feeds every 10s`)
	expect(output.stdout).toContain(`* Lorem ipsum 2026-01-01T00:00:00Z`)
}, 30000);
*/



