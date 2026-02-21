'use client';

import { useState } from "react";
import { UrlItem } from "../lib/api";
import { Check, Clock, Copy, ExternalLink, MousePointerClick, Trash2 } from "lucide-react";
import { clsx } from "clsx";

// Interface pour les propriétés du composant UrlCard, qui inclut une URL à afficher, une fonction de rappel pour la suppression de l'URL, et un indicateur pour savoir si c'est la dernière URL créée. --- IGNORE ---
interface UrlCardProps {
    url: UrlItem;
    onDelete: (id: number) => void;
    isLatest: boolean;
}

// Fonction utilitaire pour formater une date au format français. Elle prend une chaîne de caractères représentant une date, la convertit en objet Date, et utilise Intl.DateTimeFormat pour formater la date selon les conventions françaises. --- IGNORE ---
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

// Fonction utilitaire pour tronquer une URL si elle dépasse une certaine longueur. Elle prend une URL et une longueur maximale, et retourne l'URL tronquée avec des points de suspension si elle dépasse la longueur spécifiée. --- IGNORE ---
function truncateUrl(url: string, maxLength: number = 60): string {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
}

// Ce composant affiche une carte pour une URL raccourcie, avec le lien original, le lien raccourci, la date de création, et des actions pour copier ou supprimer le lien. Il gère également l'état de copie et de suppression pour fournir un retour visuel à l'utilisateur. --- IGNORE ---
export default function UrlCard({ url, onDelete, isLatest }: UrlCardProps) {
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fonction pour gérer la copie du lien raccourci dans le presse-papiers. Elle utilise l'API Clipboard du navigateur pour copier le lien et gère l'état de copie pour fournir un retour visuel à l'utilisateur. --- IGNORE ---
    const handleCopy = async (e:React.MouseEvent) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(url.shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erreur lors de la copie du lien", err);
        }
    };

    // Fonction pour gérer la suppression de l'URL. Elle appelle la fonction de rappel onDelete avec l'ID de l'URL à supprimer, et gère l'état de suppression pour fournir un retour visuel à l'utilisateur. --- IGNORE ---
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(url.id);
        } catch (err) {
            console.error("Erreur lors de la suppression de l'URL", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className={clsx(
                'card p-5 transition-all duration-300 hover:shadow-md group',
                isLatest && 'ring-2 ring-blue-500/30 border-blue-100',
                isDeleting && 'opacity-50 scale-95',
            )}
            >
            <div className="flex items-start gap-4">
                {/* Indicateur de couleur */}
                <div className={clsx(
                'w-2 h-2 rounded-full mt-2 shrink-0',
                )} />

                {/* Contenu */}
                <div className="flex-1 min-w-0 space-y-1.5">
                {/* URL courte */}
                <div className="flex items-center gap-2">
                    <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:text-blue-800 transition-colors text-sm flex items-center gap-1.5"
                    >
                    {url.shortUrl}
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </a>
                    {isLatest && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Nouveau
                    </span>
                    )}
                </div>

                {/* URL originale */}
                <p className="text-xs text-slate-400 truncate" title={url.originalUrl}>
                    {truncateUrl(url.originalUrl)}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MousePointerClick className="w-3 h-3" />
                    
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(url.createdAt)}
                    </span>
                </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                <button
                    onClick={handleCopy}
                    className={clsx(
                    'p-2 rounded-lg text-xs transition-all duration-200 flex items-center gap-1',
                    copied
                        ? 'text-green-600 bg-green-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
                    )}
                    aria-label="Copier le lien"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn-ghost p-2"
                    aria-label="Supprimer le lien"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                </div>
            </div>
        </div>
    );
}