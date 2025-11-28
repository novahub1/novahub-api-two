// api/animals-test.js
// API - Dados são apagados automaticamente a cada 40 segundos EXATOS

let animalsData = [];
const CLEANUP_INTERVAL = 40000; // 40 segundos - Tempo de apagar os dados

// Limpeza automática independente de requisições
setInterval(() => {
    const count = animalsData.length;
    if (count > 0) {
        animalsData = [];
        console.log(`Automatic cleanup: ${count} animals deleted`);
    }
}, CLEANUP_INTERVAL);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // POST - Receber animal
    if (req.method === 'POST') {
        try {
            const { animal } = req.body;
            
            if (!animal || !animal.name || !animal.generation || !animal.jobId) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid data'
                });
            }
            
            animalsData.push({
                jobId: animal.jobId,
                name: animal.name,
                generation: animal.generation
            });
            
            console.log('Animal received:', animal.name, animal.generation);
            console.log(`Total number of animals: ${animalsData.length}`);
            
            return res.status(200).json({
                animal: null,
                message: `Data will be automatically deleted in 40 seconds`
            });
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET - Retornar todos
    if (req.method === 'GET') {
        return res.status(200).json({
            animals: animalsData,
            total: animalsData.length
        });
    }
    
    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
