import { useState, useEffect } from "react";
import axios from "axios";
import { FaFacebook, FaTwitter, FaInstagram, FaDiscord, FaYoutube, FaTelegramPlane } from "react-icons/fa";

const Footer = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get("/api/settings");
                setSettings(res.data);
            } catch (err) {
                console.error("Error fetching settings for footer", err);
            }
        };
        fetchSettings();
    }, []);

    const s = settings?.footer;

    return (
        <footer style={{ background: '#0b0c18', padding: '60px 0 20px', color: '#8f92b3', fontSize: '0.9rem' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>

                {/* Brand & About */}
                <div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', marginBottom: '20px' }}>
                        skygros<span style={{ color: 'var(--accent-color)' }}>.</span>
                    </h2>
                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {s?.aboutText || "Votre source numéro un pour tout ce qui concerne le gaming."}
                    </p>
                    {s?.contactNumber && (
                        <div style={{ marginBottom: '20px', color: '#fff', fontWeight: 'bold' }}>
                            <span style={{ color: 'var(--accent-color)', marginRight: '10px' }}>Contact:</span>
                            {s.contactNumber}
                        </div>
                    )}
                    <div className="flex gap-4 flex-wrap">
                        {s?.facebookLink && <a href={s.facebookLink} target="_blank" rel="noreferrer"><FaFacebook size={20} className="hover:text-white cursor-pointer" /></a>}
                        {s?.telegramLink && <a href={s.telegramLink} target="_blank" rel="noreferrer"><FaTelegramPlane size={20} className="hover:text-white cursor-pointer" /></a>}

                        {/* Dynamic Socials */}
                        {s?.dynamicSocials?.map((social, idx) => (
                            <a key={idx} href={social.url} target="_blank" rel="noreferrer">
                                {social.icon.startsWith('http') ? (
                                    <img src={social.icon} style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} alt={social.name} />
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{social.name}</span>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Columns 1-3 */}
                {[1, 2, 3].map(num => (
                    <div key={num}>
                        <h3 style={{ color: 'white', fontWeight: 'bold', marginBottom: '20px' }}>{s?.[`col${num}Title`] || `Section ${num}`}</h3>
                        <ul className="flex flex-col gap-2">
                            {s?.[`col${num}Links`]?.map((link, idx) => (
                                <li key={idx}><a href={link.url} className="hover:text-white">{link.name}</a></li>
                            )) || <li style={{ opacity: 0.3 }}>Aucun lien</li>}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <p>&copy; {new Date().getFullYear()} Skygros. Tous droits réservés.</p>
                <div className="flex gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" height="20" style={{ filter: 'grayscale(100%)', opacity: 0.5 }} />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" height="20" style={{ filter: 'grayscale(100%)', opacity: 0.5 }} />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" height="20" style={{ filter: 'grayscale(100%)', opacity: 0.5 }} />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
