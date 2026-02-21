import axios from "axios";

// Récupération de l'URL de l'API à partir des variables d'environnement, avec une valeur par défaut pour le développement local
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Création d'une instance Axios avec une configuration de base
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// TYPE DEFINITIONS
// Interface pour les éléments d'URL retournés par l'API
export interface UrlItem {
    id: number;
    originalUrl: string;
    shortUrl: string;
    shortCode: string;
    createdAt: string;
    updatedAt: string;
}

// Interface pour la charge utile lors de la création d'une nouvelle URL
export interface CreateUrlPlayload {
    originalUrl: string;
    customCode?: string;
}


// Objet regroupant les fonctions d'API pour les opérations liées aux URL raccourcies
export const urlsApi = {

    // Fonction pour créer une nouvelle URL raccourcie en envoyant une requête POST à l'API
    create: async (payload: CreateUrlPlayload): Promise<UrlItem> => {
        const { data } = await api.post("api/urls", payload);
        return data;
    },

    // Fonction pour récupérer toutes les URL raccourcies en envoyant une requête GET à l'API
    getAll: async (): Promise<UrlItem[]> => {
        const { data } = await api.get("api/urls");
        return data;
    },
    
    // Fonction pour supprimer une URL raccourcie en envoyant une requête DELETE à l'API
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/urls/${id}`);
    },
}