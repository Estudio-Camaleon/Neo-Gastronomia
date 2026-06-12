#!/usr/bin/env node
/*
 Simple wrapper script to run Vercel Speed Insights for the app.
 Usage: node scripts/speed-insights.js <url>
*/
const { run } = require("@vercel/speed-insights");

async function main() {
  const url = process.argv[2] || "http://localhost:3000";
  try {
    const res = await run(url, { categories: ["performance"] });
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
