# Blog Aggregator CLI Tool

A terminal-based application designed to manage, follow, and aggregate RSS/Atom blog feeds. Built with TypeScript

## Existing Commands

- **Register:** Register's the user.`Command Usage:-npm run start register <user-name>`
- **Login:** Logs in the user, need to be registered first to login, when you register you auto login.`Command Usage:-npm run start login <user-name>`
- **Reset:** Deletes all the users from the db, when users are deleted the corresponding feeds, posts, feed_follows are also deleted. `Command Usage:-npm run start reset`
- **Users** shows a list of existing users, with the current logged in user marked as current.`Command Usage:-npm run start users`
- **agg** A (`agg`) command to pull latest posts from registered blogs. It's a never ending loop by design since you want it to keep running. Time between the fetch can be specified. `Command Usage:-npm run start agg <time-between-request>`
- **feeds:** Shows a list of feeds added to the db and who added them and their links. `Command Usage:- npm run start feeds`
- **addfeed** Adds a feed, `Command Usage:- npm run start addfeed <feed-name> <feed-link>`
- **follow** Follows a feed, `Command Usage:- npm run start follow <feed-link>`
- **unfollow** unfollows a feed, `Command Usage:- npm run start unfollow <feed-link>`
- **browse** browses the latest feed, `Command Usage:- npm run start browse <feed-name> 10` OR `npm run start browse <feed-link> 10`.  10 denotes the number of posts  which will be shown, can be configured, default is 2.
---

### Public Commands
These commands are accessible by any user without requiring an active session.

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `register` | `<username>` | Registers a new user account into the system and automatically logs them in. |
| `login` | `<username>` | Authenticates the session for an existing user against the database state. |
| `reset` | None | Flushes all state/tables inside the application database (Developer/Admin use). |
| `users` | None | Lists all registered profiles in the system. |
| `feeds` | None | Displays all globally registered blog feeds available to be followed. |
| `agg` | `<time_interval>` | Starts the automated background engine to scrape registered XML feeds at custom intervals (e.g., `1h`, `30m`). |

### Authenticated Commands
These commands utilize a `middlewareLoggedIn` guard. They will fail gracefully if executed without a valid local session state.

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `addfeed` | `<name> <url>` | Registers a new blog feed to the global database and automatically marks it as followed by you. |
| `follow` | `<feed_url>` | Subscribes your authenticated profile to an existing registered blog feed. |
| `following` | None | Lists all the specific blog feeds your profile is currently tracking. |
| `unfollow` | `<feed_url>` | Unsubscribes your profile from updates regarding the specified blog feed. |
| `browse` | `[limit]` | Fetches and renders the latest aggregated posts matching your followed feeds list. |

---
