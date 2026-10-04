# Cloud save with Firebase: setup

Cloud save stays hidden until `src/config/firebase.ts` has a config. Setup takes about 10 minutes and the free Spark plan is enough.

1. **Create the project.** Open <https://console.firebase.google.com> and choose *Add project*. Google Analytics is not needed.
2. **Register the web app.** In *Project settings → General → Your apps*, add a **Web** app (`</>`). Firebase Hosting is not needed. Copy `apiKey`, `authDomain`, `projectId` and `appId` from the config it shows.
3. **Sign-in methods.** In *Build → Authentication → Get started → Sign-in method*, enable:
   - **Google**: set the support e-mail and save.
   - **Email/Password**: enable the first switch only (not the e-mail link).
4. **Authorized domains.** In *Authentication → Settings → Authorized domains*, add the GitHub Pages domain, e.g. `<username>.github.io`. `localhost` is there by default.
5. **Firestore.** In *Build → Firestore Database → Create database*, pick a location close to the players (e.g. `europe-west3`) and **Production mode**.
6. **Rules.** In *Firestore → Rules*, paste the contents of `firestore.rules` from this repo and choose **Publish**.
7. **Config into the game.** Put the values from step 2 into `src/config/firebase.ts`, then build and deploy.

The values in `src/config/firebase.ts` are meant to be public, because Firebase web apps always carry them. The data is protected by the rules from step 6: each player reads and writes only their own save.

## How it works
- **Working copy on the device.** The device keeps its save in IndexedDB, so the game is fast and works offline. When a player is signed in, each change is uploaded about 3 seconds later. Bursts of changes are combined into one write.
- **Firestore layout.**
  - `users/{uid}` holds `{ updatedAt, saveVersion, session }`.
  - `users/{uid}/save/{profile|collection|decks|matches|progress|meta}` holds `{ json }`, one document per save slice.
- **First sign-in on a device.**
  - If the account is empty, the device's save is uploaded.
  - On a fresh device, the account's save is downloaded.
  - If both have different progress, the player chooses which to keep.
- **One active device.** Signing in on another device makes it the active one. The previous device stops uploading and shows a banner with *Continue here*, which loads the account's latest progress.
- **Reset account.** While signed in, *Reset account* in Settings also clears the cloud save.

## Social features: leaderboards, friends, invites
The same project also stores the season leaderboards, friend lists, online status and match invites (`src/cloud/social.ts`). They need **no extra setup** besides the rules:

- **Publish the new rules.** Every time `firestore.rules` changes, paste the whole file into *Firestore → Rules* and choose **Publish**. Until then the leaderboards stay empty and adding friends fails with *permission denied*.
- **Indexes.** None needed: every query uses a single field (`score` or `rating` for the boards, `to`/`from` for friend requests), which Firestore indexes automatically.

What the rules allow:
- **Leaderboards** `seasons/{YYYY-MM}/{aiRanked|ranked}/{uid}`: anyone can read (also signed-out players). A player writes only their own entry, only for the current UTC month, and only with valid values: name 1–20 characters, rank 0–15, Crown points only at rank 15, `score = rank × 100000 + crownPoints`, rating 100–4000, and a server timestamp.
- **Profiles** `profiles/{uid}` (name, portrait, friend code): readable by signed-in players, writable by the owner, and the friend code must belong to them.
- **Friend codes** `friendCodes/{CODE}` → `{ uid }`: looked up one at a time (no listing), created once by their owner, never taken over.
- **Friend requests** `friendRequests/{from}_{to}`: created by the sender; read and deleted by sender or recipient.
- **Friends** `users/{uid}/friends/{friendUid}`: readable by the owner. Created only while a matching friend request exists (the recipient accepting writes both lists in one batch); either friend can delete it.
- **Presence** `presence/{uid}` `{ lastSeen, inMatch }`: readable by signed-in players, written by the owner with a server timestamp about once a minute while the game is open.
- **Invites** `invites/{to}/items/{id}`: created only by a player on the recipient's friends list (`from` must be their own uid); the recipient reads, accepts (`status: 'accepted'`) or deletes (declines) it; the sender can watch and delete it.

Seasons are calendar months in UTC. At the start of a month each player gets the reward for their best Ranked vs AI rank on their own device (`src/domain/season.ts`), so the server does not need scheduled jobs.

Dev preview: `npm run dev`, then open `http://localhost:5199/?devsocial#/friends` to see the signed-in screens with fake data. It never talks to Firestore and is not part of production builds.

## Limits
The free plan allows 50,000 reads and 20,000 writes per day, and 1 GiB of data.
- An upload writes the changed slices plus the `users/{uid}` document, usually 2–4 writes.
- A typical session makes tens of uploads.
- Social: presence writes about 1 per minute per open game, leaderboard entries 1–2 writes per ranked match, and the leaderboard screen reads up to 100 documents per board view.

## Not covered
- **Cheating.** Gold, packs and rewards are still computed in the browser. A determined player could edit their own cloud save, just as they can edit IndexedDB today. Preventing that needs server-side logic (Cloud Functions), which requires the Blaze plan.
