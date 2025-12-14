
import https from 'https';

const token = process.argv[2];
if (!token) {
    console.error("Please provide a token");
    process.exit(1);
}

function httpsRequest(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.supabase.com',
            path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) { reject(e); }
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

(async () => {
    try {
        const projects = await httpsRequest('/v1/projects');
        if (!projects || projects.length === 0) {
            console.log("No projects found");
            return;
        }
        const project = projects[0];
        console.log("PROJECT_JSON:" + JSON.stringify(project));

        try {
            // Try to fetch keys if not present in project
            const keys = await httpsRequest(`/v1/projects/${project.id}/api-keys`);
            console.log("KEYS_JSON:" + JSON.stringify(keys));
        } catch (e) {
            console.log("Could not fetch separate keys: " + (e as Error).message);
        }

    } catch (e: any) {
        console.error("Error: " + e.message);
    }
})();
