require('dotenv').config();
const axios = require('axios');

async function testConnection() {
    const apiKey = process.env.NEO_API_KEY;
    console.log("---------------------------------------------------");
    console.log("TESTR CONNEXION NEO 4K API");
    console.log("---------------------------------------------------");

    if (!apiKey) {
        console.error("❌ ERREUR: NEO_API_KEY est manquant dans le fichier .env");
        return;
    }

    console.log(`🔑 Clé API détectée: ${apiKey.substring(0, 4)}*******`);
    console.log("📡 Envoi d'une requête de test (action=bouquet)...");

    try {
        const response = await axios.get('https://neo4kpro.me/api/api.php', {
            params: {
                action: 'bouquet',
                api_key: apiKey
            }
        });

        console.log("\n✅ R É P O N S E   R E Ç U E :");
        console.log("---------------------------------------------------");
        // Log only the first 3 items to keep it clean if list is long
        if (Array.isArray(response.data)) {
            console.log(`Recu ${response.data.length} bouquets.`);
            console.log("Exemple des 3 premiers:", response.data.slice(0, 3));
        } else {
            console.log(response.data);
        }
        console.log("---------------------------------------------------");
        console.log("✅ La connexion au serveur NEO 4K fonctionne correctement !");

    } catch (error) {
        console.error("\n❌ ÉCHEC DE LA REQUÊTE :");
        console.error(error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testConnection();
