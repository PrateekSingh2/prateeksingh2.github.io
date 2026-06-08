const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'status-data.json');

const servicesConfig = [
    { id: "main", url: "https://algolib.netlify.app" },
    { id: "disc", url: "https://algolib.netlify.app/discover" },
    { id: "e1", url: "https://rajawatprateek-algolib-engine-1.hf.space/health" },
    { id: "e2", url: "https://rajawatprateek-algolib-engine-2.hf.space/health" },
    { id: "e3", url: "https://rajawatprateek-algolib-engine-3.hf.space/health" },
    { id: "groq", url: "https://api.groq.com/" },
    { id: "firebase", url: "https://firebase.google.com/" },
    { id: "supabase", url: "https://oedombnbmzsuaasgpsio.supabase.co" }
];

const MAX_HISTORY = 20;

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
    let data;
    try {
        data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch(e) {
        data = { lastUpdated: 0, downtimesToday: 0, services: [] };
    }

    const now = new Date();
    const lastDate = new Date(data.lastUpdated || 0);
    
    // Reset downtimes daily
    if(now.getUTCDate() !== lastDate.getUTCDate()) {
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
        if (serviceData.history.length > MAX_HISTORY) {
            serviceData.history.shift();
        }
    }

    data.lastUpdated = now.getTime();
    
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log("Status ping complete and data saved.");
}

run();
