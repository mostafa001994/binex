import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.NODE_PATH = path.join(__dirname, "../src");

const require = createRequire(import.meta.url);

const { runNotificationScheduler } = await import(
  "../src/server/notifications/scheduler/notification-scheduler.ts"
);

const interval = 5 * 60 * 1000;

async function run() {
  try {
    const result = await runNotificationScheduler();
    console.log("notification scheduler result:", result);
  } catch (error) {
    console.error("notification worker error:", error);
  }
}

console.log("notification worker started");

await run();

setInterval(run, interval);
