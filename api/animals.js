// api/animals-test.js
// API - Data is automatically deleted every 40 seconds

let animalsData = [];
const CLEANUP_INTERVAL = 40000; // 40 seconds

// Rate limiting
const requestCounts = new Map();
const keyUsage = new Map();

// Automatic cleanup
setInterval(() => {
    const count = animalsData.length;
    if (count > 0) {
        animalsData = [];
        console.log(`Automatic cleanup: ${count} animals deleted`);
    }
}, CLEANUP_INTERVAL);

// Clear rate limit cache every 5 minutes
setInterval(() => {
    requestCounts.clear();
    keyUsage.clear();
}, 300000);

// Validate API Key
function isValidApiKey(apiKey) {
    const keysString = process.env.API_KEYS || process.env.API_KEY || '';
    const validKeys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    console.log('Received API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
    console.log('Valid keys configured:', validKeys.length);
    console.log('Environment API_KEY exists:', !!process.env.API_KEY);
    console.log('Environment API_KEYS exists:', !!process.env.API_KEYS);
    
    if (validKeys.length === 0) {
        console.error('ERROR: No API keys configured in environment variables');
        return false;
    }
    
    return validKeys.includes(apiKey);
}

// Rate limiting by IP
function checkIpRateLimit(ip) {
    const now = Date.now();
    const limit = 100;
    const window = 60000;
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    
    const timestamps = requestCounts.get(ip).filter(t => now - t < window);
    
    if (timestamps.length >= limit) {
        return false;
    }
    
    timestamps.push(now);
    requestCounts.set(ip, timestamps);
    return true;
}

// Rate limiting by API Key
function checkKeyRateLimit(apiKey) {
    const now = Date.now();
    const limit = 500;
    const window = 60000;
    
    if (!keyUsage.has(apiKey)) {
        keyUsage.set(apiKey, []);
    }
    
    const timestamps = keyUsage.get(apiKey).filter(t => now - t < window);
    
    if (timestamps.length >= limit) {
        return false;
    }
    
    timestamps.push(now);
    keyUsage.set(apiKey, timestamps);
    return true;
}

// Validate animal data
function validateAnimalData(animal) {
    if (!animal || typeof animal !== 'object') return false;
    if (!animal.name || typeof animal.name !== 'string') return false;
    if (!animal.generation || typeof animal.generation !== 'string') return false;
    if (!animal.jobId || typeof animal.jobId !== 'string') return false;
    
    if (animal.name.length > 100) return false;
    if (animal.generation.length > 50) return false;
    if (animal.jobId.length > 100) return false;
    
    return true;
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Get IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               'unknown';
    
    console.log(`Request from IP: ${ip}, Method: ${req.method}, URL: ${req.url}`);
    
    // Check IP rate limit
    if (!checkIpRateLimit(ip)) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests from this IP. Please try again later.'
        });
    }
    
    // Extract API Key from header OR query string
    let apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    // If not in headers, try to get from URL query (?key=xxx)
    if (!apiKey && req.url) {
        try {
            const url = new URL(req.url, `https://${req.headers.host}`);
            apiKey = url.searchParams.get('key');
        } catch (e) {
            console.error('Error parsing URL:', e.message);
        }
    }
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key is required. Use header X-API-Key or query parameter ?key=YOUR_KEY'
        });
    }
    
    if (!isValidApiKey(apiKey)) {
        console.log(`Invalid API key attempt from IP: ${ip}`);
        return res.status(401).json({
            success: false,
            error: 'Invalid API key'
        });
    }
    
    // Check API key rate limit
    if (!checkKeyRateLimit(apiKey)) {
        return res.status(429).json({
            success: false,
            error: 'API key rate limit exceeded. Please try again later.'
        });
    }
    
    // POST - Receive animal
    if (req.method === 'POST') {
        try {
            const { animal } = req.body;
            
            if (!validateAnimalData(animal)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid animal data'
                });
            }
            
            // Check for duplicates
            const isDuplicate = animalsData.some(
                a => a.jobId === animal.jobId && a.name === animal.name
            );
            
            if (isDuplicate) {
                return res.status(200).json({
                    success: true,
                    message: 'Duplicate animal ignored'
                });
            }
            
            animalsData.push({
                jobId: animal.jobId,
                name: animal.name,
                generation: animal.generation,
                timestamp: Date.now()
            });
            
            console.log(`Animal received: ${animal.name} (${animal.generation})`);
            console.log(`Total animals: ${animalsData.length}`);
            
            return res.status(200).json({
                success: true,
                message: 'Animal received successfully'
            });
            
        } catch (error) {
            console.error('Error processing POST:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    
    // GET - Return all animals
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            animals: animalsData,
            total: animalsData.length
        });
    }
    
    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
