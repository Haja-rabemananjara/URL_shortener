'use client';

import { useState } from "react";
import { UrlItem, urlsApi } from "../lib/api";
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Link2, Sparkles } from "lucide-react";
import { clsx } from "clsx";

// Interface pour les propriétés du composant ShortenForm, qui inclut une fonction de rappel pour la création d'une nouvelle URL et l'état de la dernière URL créée. --- IGNORE ---
interface ShortenFormProps {
    onCreated: (originalUrl: UrlItem) => void;
    latestUrl: UrlItem | null;
}

// Ce composant est responsable de l'affichage du formulaire de raccourcissement d'URL, de la gestion de l'état des entrées utilisateur, des erreurs, du chargement et de la copie du lien raccourci. Il utilise les fonctions d'API pour créer une nouvelle URL raccourcie et gère les interactions utilisateur pour fournir une expérience fluide. --- IGNORE ---
export default function ShortenForm({ onCreated, latestUrl }: ShortenFormProps) {

    // États pour gérer les erreurs, l'URL originale, le code personnalisé, l'affichage des options avancées, l'état de chargement et la copie du lien. --- IGNORE ---
    const [error, setError] = useState<string | null>(null);
    const [originalUrl, setOriginalUrl] = useState("");
    const [customCode, setCustomCode] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fonction pour gérer la soumission du formulaire de création d'une nouvelle URL raccourcie. Elle envoie une requête à l'API pour créer l'URL, gère les erreurs et met à jour l'état en conséquence. --- IGNORE ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originalUrl.trim()) return;

        setIsLoading(true);
        setError(null);

        // Tentative de création d'une nouvelle URL raccourcie en appelant l'API. En cas de succès, le formulaire est réinitialisé, la nouvelle URL est ajoutée à la liste des URL existantes via la fonction de rappel onCreated, et les options avancées sont masquées. En cas d'erreur, un message d'erreur approprié est affiché en fonction de la réponse de l'API. --- IGNORE ---
        try {
            const newUrl = await urlsApi.create({
                originalUrl: originalUrl.trim(),
                ... (customCode.trim() ? { customCode: customCode.trim() } : {}),
            });
            setOriginalUrl("");
            setCustomCode("");
            onCreated(newUrl);
            setShowAdvanced(false);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string | string[]} } };
            const msg  = axiosError?.response?.data?.message;
            if (Array.isArray(msg)) {
                setError(msg[0]);
            } else {
                setError(msg || "Une erreur est survenue lors de la création du lien.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour gérer la copie du lien raccourci dans le presse-papiers. Elle utilise l'API Clipboard du navigateur pour copier le lien et gère l'état de copie pour fournir un retour visuel à l'utilisateur. --- IGNORE ---
    const handleCopy = async () => {
        if (!latestUrl) return;
        await navigator.clipboard.writeText(latestUrl.originalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Le composant retourne un formulaire pour saisir l'URL à raccourcir, avec des options avancées pour un code personnalisé, et affiche le lien raccourci avec une option de copie une fois créé. Il gère également l'affichage des erreurs et l'état de chargement. --- IGNORE ---
    return (
        <div className="card p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* URL Input */}
                <div className="flex gap-3">
                <div className="relative flex-1">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                    
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://votre-url-tres-longue.com/chemin/vers/quelque-chose"
                    className="input pl-10"
                    required
                    disabled={isLoading}
                    aria-label="URL à raccourcir"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !originalUrl.trim()}
                    className="btn-primary whitespace-nowrap min-w-[140px]"
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        En cours…
                    </>
                    ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Raccourcir
                    </>
                    )}
                </button>
                </div>

                {/* Options avancées */}
                <div>
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Code personnalisé (optionnel)
                </button>

                {showAdvanced && (
                    <div className="mt-3 animate-slide-up">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 whitespace-nowrap">localhost:3001/</span>
                        <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                        placeholder="mon-lien"
                        maxLength={20}
                        className="input text-xs py-2 flex-1"
                        disabled={isLoading}
                        aria-label="Code court personnalisé"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Lettres, chiffres, tirets uniquement. 3–20 caractères.</p>
                    </div>
                )}
                </div>

                {/* Erreur */}
                {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">
                    {error}
                </div>
                )}
            </form>

            {/* Résultat */}
            {latestUrl && (
                <div className="border-t border-slate-100 pt-5 animate-slide-up">
                <p className="text-xs text-slate-500 mb-2 font-medium">Lien raccourci :</p>
                <div className="flex items-center gap-2">
                    <a
                    
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 font-mono text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-3 rounded-xl truncate transition-colors flex items-center gap-2"
                    >
                    
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    </a>
                    <button
                    onClick={handleCopy}
                    className={clsx(
                        'px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shrink-0',
                        copied
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
                    )}
                    aria-label="Copier le lien"
                    >
                    {copied ? (
                        <>
                        <Check className="w-4 h-4" /> Copié !
                        </>
                    ) : (
                        <>
                        <Copy className="w-4 h-4" /> Copier
                        </>
                    )}
                    </button>
                </div>
                </div>
            )}
        </div>
    );
}