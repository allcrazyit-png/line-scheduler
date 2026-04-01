import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getGroups } from "./src/lib/googleSheets.js";

async function checkGroups() {
    const groups = await getGroups();
    console.log("Groups found:", groups);
}

checkGroups().catch(console.error);
