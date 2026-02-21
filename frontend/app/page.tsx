'use client';
import { useCallback, useEffect, useState } from "react";
import { UrlItem, urlsApi } from "./src/lib/api";
import ShortenForm from "./src/components/ShortenForm";
import UrlCard from "./src/components/UrlCard";
import { Link2 } from "lucide-react";


export default function Home() {

  // États pour stocker les URL raccourcies, la dernière URL créée, les erreurs et l'état de chargement
    const [urls, setUrls] = useState<UrlItem[]>([]);
    const [latestUrl, setLatestUrl] = useState<UrlItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fonction pour charger les données des URL raccourcies depuis l'API. Elle utilise useCallback pour éviter de recréer la fonction à chaque rendu, et gère les états de chargement et d'erreur en conséquence.
    const loadData = useCallback(async () => {

        try {
            const [urlList] = await Promise.all([
                urlsApi.getAll(),
            ]);
            setUrls(urlList);
            setError(null);
        } catch {
            setError("Impossible de charger les données. Le backend est-il lancé ?");
        } finally {            
            setLoading(false);
        }
    }, []);

    // useEffect pour charger les données lorsque le composant est monté. Il dépend de la fonction loadData, qui est mémorisée grâce à useCallback, pour éviter des appels redondants.
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Fonction pour gérer la création d'une nouvelle URL raccourcie. Elle met à jour l'état latestUrl avec la nouvelle URL créée et ajoute cette URL à la liste des URL existantes si elle n'y est pas déjà présente.
    const handleCreated = useCallback((newUrl: UrlItem) => {
        setLatestUrl(newUrl);
        setUrls((prev) => {
            const exists = prev.find((u) => u.id === newUrl.id);
            if (exists) return prev;
            return [newUrl, ...prev];
        });
    }, []);

    // Fonction pour gérer la suppression d'une URL raccourcie. Elle envoie une requête de suppression à l'API, met à jour la liste des URL en filtrant celle qui a été supprimée, et réinitialise latestUrl si l'URL supprimée était la dernière créée.
    const handleDelete = useCallback(async (id: number) => {
        try {
            await urlsApi.delete(id);
            setUrls((prev) => prev.filter((u) => u.id !== id));
            if (latestUrl?.id === id) setLatestUrl(null);
        } catch (error) {
            setError("Erreur lors de la suppression de l'URL");
        }
    }, [latestUrl]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">URL Shortener</h1>
            <p className="text-xs text-slate-500">Raccourcissez vos liens en un clic</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Hero + Form */}
        <section className="text-center space-y-3">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Vos liens,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              raccourcis.
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Transformez n&apos;importe quelle URL en lien court, partageable en un instant.
          </p>
        </section>

        <ShortenForm onCreated={handleCreated} latestUrl={latestUrl} />


        {/* Error */}
        {error && (
          <div className="card p-4 border-red-100 bg-red-50 text-red-700 text-sm flex items-center gap-2 animate-fade-in">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {/* URL List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
              Liens raccourcis
            </h3>
            {urls.length > 0 && (
              <span className="text-xs text-slate-400">{urls.length} lien{urls.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="card p-12 text-center text-slate-400">
              <Link2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun lien pour l&apos;instant</p>
              <p className="text-sm mt-1">Raccourcissez votre première URL ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {urls.map((url) => (
                <UrlCard
                  key={url.id}
                  url={url}
                  onDelete={handleDelete}
                  isLatest={url.id === latestUrl?.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}