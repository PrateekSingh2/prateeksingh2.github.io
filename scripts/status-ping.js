const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../public/status-data.json');
const configFile = path.join(__dirname, '../status-config.json');
const publishMode = process.env.STATUS_DATA_TARGET || 'local';
const gistId = process.env.GIST_ID;
const gistFilename = process.env.GIST_FILENAME || 'status-data.json';
const gistToken = process.env.GIST_TOKEN;
const refreshIntervalMs = Number(process.env.REFRESH_INTERVAL_MS || 300000);

const servicesConfig = [
    { id: "main", url: "https://algolib.netlify.app" },
    { id: "assets", url: "https://res.cloudinary.com/" },
    { id: "e1", url: "https://rajawatprateek-algolib-engine-1.hf.space" },
    { id: "e2", url: "https://rajawatprateek-algolib-engine-2.hf.space" },
    { id: "e3", url: "https://rajawatprateek-algolib-engine-3.hf.space" },
    { id: "groq", url: "https://api.groq.com/" },
    { id: "firebase", url: "https://algolib-e0567.firebaseapp.com" },
    { id: "supabase", url: "https://oedombnbmzsuaasgpsio.supabase.co" }
];

function createDefaultData() {
    return { lastUpdated: 0, downtimesToday: 0, refreshIntervalMs, nextRefreshAt: 0, services: [] };
}

function normalizeData(data) {
    const normalized = data && typeof data === 'object' ? data : createDefaultData();
    normalized.lastUpdated = normalized.lastUpdated || 0;
    normalized.downtimesToday = normalized.downtimesToday || 0;
    normalized.refreshIntervalMs = normalized.refreshIntervalMs || refreshIntervalMs;
    normalized.nextRefreshAt = normalized.nextRefreshAt || 0;
    normalized.services = Array.isArray(normalized.services) ? normalized.services : [];

    for (const config of servicesConfig) {
        let serviceData = normalized.services.find(s => s.id === config.id);
        if (!serviceData) {
            serviceData = { id: config.id, history: [], status: 'PENDING' };
            normalized.services.push(serviceData);
        }

        if (!Array.isArray(serviceData.history)) {
            serviceData.history = [];
        }

        if (typeof serviceData.status !== 'string') {
            serviceData.status = 'PENDING';
        }
    }

    return normalized;
}

async function loadExistingData() {
    if (publishMode === 'gist' && gistId && gistToken) {
        try {
            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `Bearer ${gistToken}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (response.ok) {
                const gist = await response.json();
                const gistFile = gist?.files?.[gistFilename];
                if (gistFile?.content) {
                    return normalizeData(JSON.parse(gistFile.content));
                }

                if (gistFile?.raw_url) {
                    const rawResponse = await fetch(gistFile.raw_url, { cache: 'no-store' });
                    if (rawResponse.ok) {
                        return normalizeData(await rawResponse.json());
                    }
                }
            }
        } catch (error) {
            // Fall back to the local cached file below.
        }
    }

    try {
        return normalizeData(JSON.parse(fs.readFileSync(dataFile, 'utf8')));
    } catch (error) {
        return normalizeData(createDefaultData());
    }
}

async function pingUrl(url) {
    const start = performance.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        await fetch(url + "?t=" + Date.now(), { signal: controller.signal });
        clearTimeout(timeoutId);

        return Math.round(performance.now() - start);
    } catch (e) {
        return -1;
    }
}

async function run() {
    let data = await loadExistingData();

    const now = new Date();
    const lastDate = new Date(data.lastUpdated || 0);

    // Reset downtimes daily
    if (now.getUTCDate() !== lastDate.getUTCDate()) {
        data.downtimesToday = 0;
    }

    for (const config of servicesConfig) {
        let serviceData = data.services.find(s => s.id === config.id);
        if (!serviceData) {
            serviceData = { id: config.id, history: [], status: "PENDING" };
            data.services.push(serviceData);
        }

        const latency = await pingUrl(config.url);

        if (latency === -1) {
            serviceData.status = "OFFLINE";
            data.downtimesToday++;
        } else if (latency > 800) {
            serviceData.status = "DEGRADED";
        } else {
            serviceData.status = "ONLINE";
        }

        serviceData.history.push(latency);

        // 12 hours = 720 minutes. At 5 min intervals, that's 144 data points.
        // Slice the array to keep only the last 144 entries (sliding window).
        const MAX_HISTORY = 144;
        if (serviceData.history.length > MAX_HISTORY) {
            serviceData.history = serviceData.history.slice(-MAX_HISTORY);
        }
    }

    data.lastUpdated = now.getTime();
    data.refreshIntervalMs = refreshIntervalMs;
    data.nextRefreshAt = data.lastUpdated + refreshIntervalMs;

    if (publishMode === 'gist') {
        if (!gistId || !gistToken) {
            throw new Error('Gist mode requires GIST_ID and GIST_TOKEN');
        }

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${gistToken}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [gistFilename]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update gist: HTTP ${response.status}`);
        }

        const updatedGist = await response.json();
        const rawUrl = updatedGist?.files?.[gistFilename]?.raw_url;

        if (rawUrl) {
            fs.writeFileSync(configFile, JSON.stringify({ statusDataUrl: rawUrl }, null, 2));
        }

        console.log(`Status data updated in gist ${gistId}.`);
        return;
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    console.log("Status ping complete and data saved.");
}

run();
