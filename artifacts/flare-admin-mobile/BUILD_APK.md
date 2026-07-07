# How to build the Flare Admin APK

Everything is already prepared in this folder. You only need a **free Expo account** and about 20 minutes (most of it is waiting for the build).

## One-time setup (on your own computer)

1. Install Node.js from https://nodejs.org (LTS version) if you don't have it.
2. Create a free account at https://expo.dev/signup
3. Download this folder (`artifacts/flare-admin-mobile`) to your computer
   (in Replit: three-dot menu on the folder → Download, or download the whole project as a zip).
4. Open a terminal inside the folder and run:

   ```
   npm install
   npx eas-cli login
   npx eas-cli init
   ```

   - `login` — enter your Expo account email + password
   - `init` — press Enter to accept creating the project (this links the app to your account and adds a `projectId` to app.json — needed for push notifications)

   **If `npm install` fails** (e.g. an error mentioning "catalog:" or leftover files from an earlier try), clean up and retry:

   ```
   rm -rf node_modules package-lock.json
   npm install
   ```

   Make sure you're using the latest downloaded copy of this folder — older versions had a package.json that only worked inside Replit.

## Enable push notifications (one-time, ~5 minutes)

Push notifications on Android need a (free) Firebase project:

1. Go to https://console.firebase.google.com → **Add project** (any name, e.g. "Flare Admin"). You can disable Analytics.
2. Inside the project: **Add app → Android**. Enter package name exactly: `com.flarebytk.admin`
3. Download the **google-services.json** file it gives you and put it in this folder (next to app.json).
4. In Firebase: Project settings → **Service accounts** → **Generate new private key** → download the JSON file.
5. Upload that key to Expo:

   ```
   npx eas-cli credentials
   ```

   Choose: **Android** → your project → **Google Service Account** → **Manage your Google Service Account Key for Push Notifications (FCM V1)** → **Set up** → select the downloaded key file.

6. Add this line to `app.json` inside the `"android"` section:

   ```json
   "googleServicesFile": "./google-services.json",
   ```

## Build the APK

```
npx eas-cli build -p android --profile preview
```

- The build runs on Expo's servers (free tier is fine). Takes ~15 minutes.
- When it finishes you get a **download link** — open it on your phone and install the APK
  (allow "install from unknown sources" when Android asks).

## Install & use

1. Open the app, keep the address as `https://flarebytk.com`, enter your admin password, tap **Connect**.
2. Allow notifications when asked.
3. Done — new orders will ring loudly (even when the phone is locked) until you tap **ACCEPT ORDER**.

## Tips

- The ringing notification works even when the app is closed, thanks to push notifications.
- While the app is open, it also rings continuously on its own until every new order is accepted.
- If you change the admin password later, just log out in the app and log back in.
- Reminder pushes for unaccepted orders are set up via Vercel Cron (`vercel.json`, once per day — the maximum Vercel's free Hobby plan allows; a more frequent schedule makes the deploy fail). The instant "New Order" push always works. For repeat reminders every minute, either upgrade to Vercel Pro and change the schedule, or use a free service like cron-job.org to call `https://flarebytk.com/api/cron/remind` every minute (set a `CRON_SECRET` env var on Vercel and send it as `Authorization: Bearer <secret>`).
