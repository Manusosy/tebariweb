import fs from 'fs';

try {
    const content = fs.readFileSync('supabase_info.json', 'utf8');
    // It seems the file might be UTF16 encoded or contain null bytes if 'type' command showed garbage before.
    // But type command output in Step 168 seemed clean ASCII/UTF8?
    // "PROJECT_JSON:{\"id\"..."

    // Let's try to match PROJECT_JSON
    const match = content.match(/PROJECT_JSON:(.+?)(?:\r|\n|$)/);
    if (match) {
        const json = JSON.parse(match[1]);
        console.log("Region:", json.region);
        console.log("Infra:", json.infrastructure);
        // Maybe host?
        console.log("Host:", json.db_host);
        console.log("Full:", JSON.stringify(json, null, 2));
    } else {
        console.log("No PROJECT_JSON found");
        // Try finding ANY json
        const m2 = content.match(/\{.*\}/);
        if (m2) console.log("Found JSON:", m2[0]);
    }
} catch (e) {
    console.log(e);
}
