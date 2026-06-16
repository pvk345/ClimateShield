const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load env variables
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const ws = require("ws");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

async function uploadCounties() {
  const filePath = path.join(__dirname, "../data/counties.json");
  const counties = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log(`Uploading ${counties.length} counties to Supabase...`);

  // Upload in batches of 500
  const batchSize = 500;
  for (let i = 0; i < counties.length; i += batchSize) {
    const batch = counties.slice(i, i + batchSize);
    const { error } = await supabase.from("county_risk").insert(batch);
    if (error) {
      console.error("Error uploading batch:", error);
    } else {
      console.log(`Uploaded ${Math.min(i + batchSize, counties.length)} / ${counties.length}`);
    }
  }

  console.log("Done!");
}

uploadCounties();