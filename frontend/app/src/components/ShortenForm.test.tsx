'use strict';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { urlsApi } from '../lib/api';

import ShortenForm from './ShortenForm';
import { fireEvent, render, waitFor, } from '@testing-library/react';

// Mock de l'API
jest.mock('../lib/api', () => ({
  urlsApi: {
    create: jest.fn(),
  },
}));

const mockOnCreated = jest.fn();

const mockUrl = {
  id: '1',
  originalUrl: 'https://example.com',
  shortCode: 'abc123',
  shortUrl: 'http://localhost:3001/abc123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ShortenForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre le formulaire correctement', () => {
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={null} />);
    expect(screen.getByPlaceholderText(/votre-url-tres-longue/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /raccourcir/i })).toBeInTheDocument();
  });

  it('devrait afficher une erreur si le champ URL est vide', async () => {
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={null} />);
    const button = screen.getByRole('button', { name: /raccourcir/i });
    expect(button).toBeDisabled();
  });

  it('devrait appeler onCreated après soumission réussie', async () => {
    (urlsApi.create as jest.Mock).mockResolvedValue(mockUrl);
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={null} />);

    const input = screen.getByPlaceholderText(/votre-url-tres-longue/i);
    await userEvent.type(input, 'https://example.com');
    
    const button = screen.getByRole('button', { name: /raccourcir/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(urlsApi.create).toHaveBeenCalledWith({ originalUrl: 'https://example.com' });
      expect(mockOnCreated).toHaveBeenCalledWith(mockUrl);
    });
  });

  it('devrait afficher une erreur en cas d\'échec de l\'API', async () => {
    (urlsApi.create as jest.Mock).mockRejectedValue({
      response: { data: { message: 'URL invalide' } },
    });
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={null} />);

    const input = screen.getByPlaceholderText(/votre-url-tres-longue/i);
    await userEvent.type(input, 'https://example.com');
    fireEvent.click(screen.getByRole('button', { name: /raccourcir/i }));

    await waitFor(() => {
      expect(screen.getByText('URL invalide')).toBeInTheDocument();
    });
  });

  it('devrait afficher le résultat quand latestUrl est fourni', () => {
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={mockUrl} />);
    expect(screen.getByRole('button', { name: /copier/i })).toBeInTheDocument();
  });

  it('devrait afficher le champ code personnalisé au clic', async () => {
    render(<ShortenForm onCreated={mockOnCreated} latestUrl={null} />);
    const advancedBtn = screen.getByText(/code personnalisé/i);
    fireEvent.click(advancedBtn);
    expect(screen.getByPlaceholderText('mon-lien')).toBeInTheDocument();
  });
});
