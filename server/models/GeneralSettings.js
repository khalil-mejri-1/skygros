const mongoose = require('mongoose');

const GeneralSettingsSchema = new mongoose.Schema({
    smtpEmail: { type: String, default: "" },
    smtpPassword: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" }, // Admin WhatsApp Number for notifications
    footer: {
        aboutText: { type: String, default: "satpromax est en train de devenir un leader mondial dans le domaine du divertissement numérique..." },
        contactNumber: { type: String, default: "+216 22 484 915" },
        facebookLink: { type: String, default: "#" },
        telegramLink: { type: String, default: "#" },
        dynamicSocials: [
            { name: { type: String }, icon: { type: String }, url: { type: String } }
        ],
        col1Title: { type: String, default: "IPTV & Sharing" },
        col1Links: [
            { name: { type: String }, url: { type: String } }
        ],
        col2Title: { type: String, default: "Streaming" },
        col2Links: [
            { name: { type: String }, url: { type: String } }
        ],
        col3Title: { type: String, default: "Cartes Cadeaux" },
        col3Links: [
            { name: { type: String }, url: { type: String } }
        ],
        newsletterTitle: { type: String, default: "Newsletter" },
        newsletterDesc: { type: String, default: "Abonnez-vous pour recevoir des offres spéciales et des cadeaux exclusifs." }
    },
    ranks: [
        {
            name: { type: String, default: "Bronze" },
            minPurchases: { type: Number, default: 0 },
            rewardDemoCount: { type: Number, default: 0 },
            color: { type: String, default: "#cd7f32" },
            icon: { type: String, default: "FaMedal" }
        },
        {
            name: { type: String, default: "Silver" },
            minPurchases: { type: Number, default: 10 },
            color: { type: String, default: "#c0c0c0" },
            icon: { type: String, default: "FaMedal" }
        },
        {
            name: { type: String, default: "Gold" },
            minPurchases: { type: Number, default: 20 },
            color: { type: String, default: "#ffd700" },
            icon: { type: String, default: "FaMedal" }
        }
    ],
    home: {
        carousel: {
            type: [{
                image: { type: String },
                title: { type: String },
                subtitle: { type: String },
                color: { type: String },
                buttonText: { type: String, default: "DÉCOUVRIR" },
                link: { type: String, default: "#" }
            }],
            default: [
                {
                    image: "/assets/slider2.png",
                    title: "Cyberpunk Edge",
                    subtitle: "FUTUR DU GAMING",
                    color: "#ff9900"
                },
                {
                    image: "/assets/slider1.png",
                    title: "Elden Legends",
                    subtitle: "PRÉPAREZ-VOUS À CONQUÉRIR",
                    color: "#8e44ad"
                },
                {
                    image: "/assets/slider3.png",
                    title: "Sports Mondiaux",
                    subtitle: "EXPÉRIENCE ULTIME",
                    color: "#00d285"
                }
            ]
        },
        hero: {
            title: { type: String, default: "La Solution Wholesale IPTV Pour Les Professionnels" },
            coloredWord: { type: String, default: "Wholesale IPTV" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)" },
            subtitle: { type: String, default: "Boostez votre business avec notre infrastructure IPTV professionnelle. Panel de gestion complet, API REST, livraison instantanée et marges compétitives jusqu'à 300%." },
            primaryBtnText: { type: String, default: "Commencer Gratuitement" },
            primaryBtnLink: { type: String, default: "/register" },
            secondaryBtnText: { type: String, default: "Voir la Démo" },
            secondaryBtnLink: { type: String, default: "/demos" },
            stats: {
                type: [{
                    value: { type: String },
                    label: { type: String }
                }],
                default: [
                    { value: "22K+", label: "Chaînes TV" },
                    { value: "99.9%", label: "Uptime SLA" },
                    { value: "<24h", label: "Support 24/7" },
                    { value: "API", label: "Intégration complète" }
                ]
            }
        },
        movies: {
            title: { type: String, default: "Derniers Films Ajoutés" },
            coloredWord: { type: String, default: "Films Ajoutés" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Découvrez les nouveautés disponibles sur notre plateforme VOD" }
        },
        channels: {
            title: { type: String, default: "Watch All Channels with IPTV No Cable TV Required" },
            coloredWord: { type: String, default: "IPTV" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "We offer thousands of TV channels covering Canada, United States, United Kingdom, Portugal, Albania, Germany, Italy, France, Brazil, Romania, Greece, Spain, Sweden, Finland, Ireland, Norway, Denmark, Latin American countries, Arab countries, and almost all countries worldwide." },
            items: {
                type: [{
                    name: { type: String },
                    image: { type: String },
                    link: { type: String, default: "#" }
                }],
                default: [
                    { name: "ABC News", link: "#" }, { name: "beIN", link: "#" }, { name: "CNN", link: "#" },
                    { name: "Disney", link: "#" }, { name: "ESPN", link: "#" }, { name: "FOX", link: "#" },
                    { name: "HBO", link: "#" }, { name: "NBC", link: "#" }, { name: "AMC", link: "#" },
                    { name: "NBA", link: "#" }, { name: "Eleven", link: "#" }, { name: "Canal+", link: "#" },
                    { name: "BT Sport", link: "#" }, { name: "Play", link: "#" }, { name: "DAZN", link: "#" },
                    { name: "Nova", link: "#" }, { name: "Super", link: "#" }, { name: "SN", link: "#" }
                ]
            }
        },
        sportsSection: {
            title: { type: String, default: "The Best IPTV 2025 To Watch All International Sports Events, including ppv iptv" },
            coloredWord: { type: String, default: "Sports Events" },
            color: { type: String, default: "#ef4444" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)" },
            subtitle: { type: String, default: "Our sports channels cover a vast variety of sports including football, basketball, baseball, tennis, golf, rugby, and more." },
            items: {
                type: [{
                    name: { type: String },
                    image: { type: String },
                    link: { type: String, default: "#" }
                }],
                default: [
                    { name: "LaLiga", link: "#" }, { name: "Serie A", link: "#" }, { name: "Premier", link: "#" },
                    { name: "Champions", link: "#" }, { name: "Europa", link: "#" }, { name: "NHL", link: "#" },
                    { name: "NFL", link: "#" }, { name: "MLB", link: "#" }, { name: "MLS", link: "#" },
                    { name: "NBA", link: "#" }, { name: "F1", link: "#" }, { name: "Bundesliga", link: "#" }
                ]
            }
        },
        devicesSection: {
            title: { type: String, default: "All Devices Are Supported" },
            coloredWord: { type: String, default: "Devices" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Our IPTV service is compatible with all devices. You can enjoy your favorite channels on your smartphone, tablet, smart TV, or computer." },
            items: {
                type: [{
                    name: { type: String },
                    icon: { type: String }
                }],
                default: [
                    { name: "FireTV", icon: "fab fa-amazon" },
                    { name: "Android", icon: "fab fa-android" },
                    { name: "Roku", icon: "fas fa-tv" },
                    { name: "Xbox", icon: "fab fa-xbox" },
                    { name: "Apple", icon: "fab fa-apple" },
                    { name: "Windows", icon: "fab fa-windows" }
                ]
            }
        },
        countriesSection: {
            title: { type: String, default: "More Than 50 Countries Available" },
            coloredWord: { type: String, default: "50 Countries" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "We offer thousands of TV channels from all over the world." },
            items: {
                type: [{
                    name: { type: String },
                    image: { type: String }
                }],
                default: [
                    { name: "France", image: "https://flagcdn.com/w160/fr.png" },
                    { name: "UK", image: "https://flagcdn.com/w160/gb.png" },
                    { name: "USA", image: "https://flagcdn.com/w160/us.png" },
                    { name: "Canada", image: "https://flagcdn.com/w160/ca.png" },
                    { name: "Spain", image: "https://flagcdn.com/w160/es.png" },
                    { name: "Portugal", image: "https://flagcdn.com/w160/pt.png" }
                ]
            }
        },
        pricingSection: {
            title: { type: String, default: "Tarifs Wholesale" },
            coloredWord: { type: String, default: "Wholesale" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Plus vous achetez de crédits, plus le prix unitaire est bas." },
            toggleLabel1: { type: String, default: "Paiement Unique" },
            toggleLabel2: { type: String, default: "Abonnement Mensuel" },
            toggleBadge: { type: String, default: "-20%" },
            footerText: { type: String, default: "1 Crédit = 1 Mois d'abonnement | Paiement sécurisé par Crypto, PayPal ou virement bancaire" },
            items: {
                type: [{
                    badge: { type: String },
                    title: { type: String },
                    subtitle: { type: String },
                    price: { type: String },
                    unit: { type: String, default: "/crédit" },
                    features: [String],
                    buttonText: { type: String, default: "Choisir ce pack" },
                    isPopular: { type: Boolean, default: false },
                    highlightColor: { type: String, default: "#6366f1" }
                }],
                default: [
                    {
                        badge: "Starter",
                        title: "Pack Démarrage",
                        subtitle: "Parfait pour tester le service",
                        price: "2.50€",
                        unit: "/crédit",
                        features: ["Minimum 20 crédits", "Panel de base", "Support par email", "Mise à jour auto"],
                        buttonText: "Choisir ce pack",
                        isPopular: false
                    },
                    {
                        badge: "Populaire",
                        title: "Pack Pro",
                        subtitle: "Pour les revendeurs actifs",
                        price: "1.80€",
                        unit: "/crédit",
                        features: ["Minimum 100 crédits", "Panel Pro + Statistiques", "API Access", "Support WhatsApp 24/7", "White Label possible"],
                        buttonText: "Choisir ce pack",
                        isPopular: true,
                        highlightColor: "#6366f1"
                    },
                    {
                        badge: "Enterprise",
                        title: "Pack Platinum",
                        subtitle: "Pour les gros volumes",
                        price: "1.20€",
                        unit: "/crédit",
                        features: ["Minimum 500 crédits", "Panel Entreprise", "API + Webhooks", "Account Manager dédié", "Custom DNS"],
                        buttonText: "Contacter les ventes",
                        isPopular: false
                    }
                ]
            }
        },
        featuresSection: {
            title: { type: String, default: "Pourquoi Choisir SKYGROS ?" },
            coloredWord: { type: String, default: "SKYGROS" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Une infrastructure robuste conçue pour les revendeurs sérieux qui veulent scaler leur business." },
            items: {
                type: [{
                    title: { type: String },
                    description: { type: String },
                    icon: { type: String },
                    iconBg: { type: String, default: "bg-primary/20" },
                    iconColor: { type: String, default: "text-primary" }
                }],
                default: [
                    { title: "Panel Admin Pro", description: "Gérez vos clients, créez des lignes IPTV, surveillez l'utilisation en temps réel depuis une interface intuitive et moderne.", icon: "fas fa-server", iconBg: "bg-primary/20", iconColor: "text-primary" },
                    { title: "API REST Complète", description: "Automatisez la création et le renouvellement des abonnements. Documentation complète avec exemples en PHP, Node.js et Python.", icon: "fas fa-code", iconBg: "bg-secondary/20", iconColor: "text-secondary" },
                    { title: "Livraison Instantanée", description: "Crédits ajoutés instantanément. Création de lignes en moins de 2 secondes. Zéro délai d'attente pour vos clients.", icon: "fas fa-bolt", iconBg: "bg-accent/20", iconColor: "text-accent" },
                    { title: "Anti-Freeze™", description: "Technologie propriétaire de buffering réduite. Serveurs CDN répartis sur 12 pays pour une latence minimale.", icon: "fas fa-shield-alt", iconBg: "bg-green-500/20", iconColor: "text-green-400" },
                    { title: "Support Prioritaire", description: "Assistance technique dédiée pour les revendeurs via Telegram, WhatsApp et ticket system. Réponse garantie sous 1h.", icon: "fas fa-headset", iconBg: "bg-orange-500/20", iconColor: "text-orange-400" },
                    { title: "Analyses Détaillées", description: "Statistiques de vente, taux de renouvellement, chaînes les plus regardées. Export CSV et rapports automatisés.", icon: "fas fa-chart-line", iconBg: "bg-pink-500/20", iconColor: "text-pink-400" }
                ]
            }
        },
        panelSection: {
            title: { type: String, default: "Panel Reseller Ultra-Moderne" },
            coloredWord: { type: String, default: "Reseller" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Gérez votre business IPTV comme un pro avec notre dashboard intuitif. Créez, modifiez, supprimez des lignes en quelques clics." },
            primaryBtnText: { type: String, default: "Voir la Démo Live" },
            primaryBtnLink: { type: String, default: "/demos" },
            items: {
                type: [{
                    title: { type: String },
                    description: { type: String },
                    icon: { type: String },
                    iconBg: { type: String, default: "bg-primary/20" },
                    iconColor: { type: String, default: "text-primary" }
                }],
                default: [
                    { title: "Gestion Multi-Utilisateurs", description: "Créez des sous-revendeurs avec des limites de crédits personnalisables.", icon: "fas fa-users", iconBg: "bg-primary/20", iconColor: "text-primary" },
                    { title: "100% Responsive", description: "Gérez vos clients depuis votre smartphone, tablette ou ordinateur.", icon: "fas fa-mobile-alt", iconBg: "bg-secondary/20", iconColor: "text-secondary" },
                    { title: "Historique Complet", description: "Suivi de toutes les actions, renouvellements et connexions en temps réel.", icon: "fas fa-history", iconBg: "bg-accent/20", iconColor: "text-accent" }
                ]
            }
        },
        librarySection: {
            title: { type: String, default: "Contenu Premium" },
            coloredWord: { type: String, default: "Premium" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            subtitle: { type: String, default: "Plus de 22,000 chaînes et 80,000 VOD dans toutes les langues" },
            items: {
                type: [{
                    title: { type: String },
                    description: { type: String },
                    icon: { type: String },
                    iconColor: { type: String }
                }],
                default: [
                    { title: "Sports", description: "Tous les matchs en 4K/FHD", icon: "fas fa-futbol", iconColor: "text-primary" },
                    { title: "Cinéma", description: "Derniers films et classiques", icon: "fas fa-film", iconColor: "text-secondary" },
                    { title: "Jeunesse", description: "Dessins animés et éducatif", icon: "fas fa-child", iconColor: "text-accent" },
                    { title: "International", description: "50+ pays disponibles", icon: "fas fa-globe", iconColor: "text-pink-400" }
                ]
            },
            tags: {
                type: [String],
                default: ["France", "Belgique", "Suisse", "UK", "USA", "Canada", "Espagne", "Portugal", "+42 autres"]
            }
        },
        testimonialsSection: {
            title: { type: String, default: "Ils Nous Font Confiance" },
            coloredWord: { type: String, default: "Confiance" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            items: {
                type: [{
                    name: { type: String },
                    role: { type: String },
                    text: { type: String },
                    initials: { type: String },
                    stars: { type: Number, default: 5 },
                    color: { type: String, default: "from-primary to-secondary" }
                }],
                default: [
                    { name: "Alex K.", role: "Revendeur depuis 2021", text: "Le meilleur fournisseur avec lequel j'ai travaillé. L'API est stable, le support réactif et mes clients sont satisfaits. J'ai multiplié mon CA par 3 en 6 mois.", initials: "AK", color: "from-primary to-secondary" },
                    { name: "Sarah M.", role: "Agence Digital", text: "L'intégration API a été un jeu changer pour mon business. Je peux maintenant vendre des abonnements automatiquement sur mon site sans intervention manuelle.", initials: "SM", color: "from-secondary to-accent" },
                    { name: "Jean D.", role: "Revendeur Pro", text: "Le panel est intuitif et professionnel. La qualité des streams est excellente avec très peu de buffering. Je recommande à 100% pour les sérieux.", initials: "JD", color: "from-accent to-primary" }
                ]
            }
        },
        faqSection: {
            title: { type: String, default: "Questions Fréquentes" },
            coloredWord: { type: String, default: "Fréquentes" },
            color: { type: String, default: "#6366f1" },
            useGradient: { type: Boolean, default: true },
            gradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
            items: {
                type: [{
                    q: { type: String },
                    a: { type: String }
                }],
                default: [
                    { q: "Comment fonctionne le système de crédits ?", a: "1 crédit équivaut à 1 mois d'abonnement pour 1 appareil. Vous achetez des crédits en gros à prix réduit et vous les utilisez pour créer des lignes IPTV pour vos clients. Plus vous achetez de crédits, plus le prix unitaire est bas." },
                    { q: "Puis-je tester le service avant d'acheter ?", a: "Oui, nous offrons un compte démo avec 5 crédits pour tester le panel et la qualité des streams. Contactez-nous via Telegram ou le chat pour obtenir votre accès test." },
                    { q: "Quels sont les délais de livraison ?", a: "Les crédits sont ajoutés instantanément après confirmation du paiement (souvent moins de 2 minutes). Pour les virements bancaires, cela peut prendre 24-48h." },
                    { q: "Proposez-vous du support technique ?", a: "Absolument. Nous offrons un support 24/7 via Telegram, WhatsApp et ticket system. Les revendeurs Pro et Platinum ont accès à un support prioritaire avec temps de réponse garanti sous 1 heure." }
                ]
            }
        },
        ctaSection: {
            title: { type: String, default: "Prêt à Développer Votre Business ?" },
            subtitle: { type: String, default: "Rejoignez plus de 15,000 revendeurs qui nous font confiance. Commencez avec seulement 20 crédits." },
            primaryBtnText: { type: String, default: "Créer un Compte Gratuit" },
            primaryBtnLink: { type: String, default: "/register" },
            secondaryBtnText: { type: String, default: "Discuter sur Telegram" },
            secondaryBtnLink: { type: String, default: "#" },
            features: {
                type: [String],
                default: ["Sans engagement", "Support inclus", "Mise à jour auto"]
            }
        },
        footerSection: {
            brandTitle: { type: String, default: "SKYGROS" },
            brandColoredWord: { type: String, default: "Wholesale" },
            description: { type: String, default: "La solution wholesale IPTV la plus fiable pour les revendeurs professionnels. Infrastructure stable, API puissante et support 24/7." },
            copyright: { type: String, default: "© 2026SKYGROS. Tous droits réservés." },
            socials: {
                type: [{
                    icon: { type: String },
                    link: { type: String }
                }],
                default: [
                    { icon: "fab fa-telegram", link: "#" },
                    { icon: "fab fa-whatsapp", link: "#" },
                    { icon: "fab fa-discord", link: "#" },
                    { icon: "fab fa-skype", link: "#" }
                ]
            },
            columns: {
                type: [{
                    title: { type: String },
                    links: [{
                        name: { type: String },
                        link: { type: String }
                    }]
                }],
                default: [
                    {
                        title: "Produit",
                        links: [
                            { name: "Fonctionnalités", link: "#" },
                            { name: "Tarifs", link: "#" },
                            { name: "API Documentation", link: "#" },
                            { name: "Panel Demo", link: "#" }
                        ]
                    },
                    {
                        title: "Support",
                        links: [
                            { name: "Centre d'aide", link: "#" },
                            { name: "Status Serveur", link: "#" },
                            { name: "Contact", link: "#" },
                            { name: "Affiliation", link: "#" }
                        ]
                    },
                    {
                        title: "Légal",
                        links: [
                            { name: "CGV", link: "#" },
                            { name: "Politique de confidentialité", link: "#" },
                            { name: "DMCA", link: "#" },
                            { name: "Contact", link: "#" }
                        ]
                    }
                ]
            }
        },
        statsCards: {
            type: [{
                title: { type: String },
                value: { type: String },
                icon: { type: String },
                accent: { type: String },
                label: { type: String }
            }],
            default: [
                {
                    title: "Total Codes",
                    value: "2,245",
                    icon: "FaShoppingCart",
                    accent: "#0099ff",
                    label: "ACHETÉS"
                },
                {
                    title: "Abos Actifs",
                    value: "16",
                    icon: "MdOndemandVideo",
                    accent: "#ff4757",
                    label: "beIN Sports"
                },
                {
                    title: "Sur Demande",
                    value: "51",
                    icon: "FaUser",
                    accent: "#00d285",
                    label: "REQUÊTES"
                }
            ]
        },
        bestSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        bestSellersTitle: { type: String, default: "Meilleures Ventes" },
        bestSellersColoredWord: { type: String, default: "Ventes" },
        deals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        dealsTitle: { type: String, default: "Deals" },
        dealsColoredWord: { type: String, default: "Deals" },
        dealsSubtitle: { type: String, default: "Offres exceptionnelles à durée limitée" },
        membershipsSection: {
            title: { type: String, default: "Memberships" },
            items: {
                type: [{
                    title: { type: String },
                    image: { type: String },
                    link: { type: String, default: "#" }
                }],
                default: [
                    { title: "Nintendo Switch Online", image: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=1000", link: "#" },
                    { title: "Xbox Game Pass", image: "https://images.unsplash.com/photo-1605906302474-3c7340c6170f?auto=format&fit=crop&q=80&w=1000", link: "#" },
                    { title: "PlayStation Plus", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000", link: "#" }
                ]
            }
        },
        giftCardsSection: {
            title: { type: String, default: "Gift Cards" },
            items: {
                type: [{
                    title: { type: String },
                    subtitle: { type: String },
                    link: { type: String, default: "#" },
                    color: { type: String, default: "#0070d1" }
                }],
                default: [
                    { title: "PlayStation", subtitle: "Gift Cards", link: "#", color: "#0070d1" },
                    { title: "Xbox", subtitle: "Gift Cards", link: "#", color: "#107c10" },
                    { title: "Nintendo", subtitle: "E-Shop Cards", link: "#", color: "#e60012" },
                    { title: "Steam", subtitle: "Gift Cards", link: "#", color: "#171a21" }
                ]
            }
        },
        sports: [{ // For backward compatibility
            name: { type: String },
            image: { type: String }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('GeneralSettings', GeneralSettingsSchema);
