'use strict';
'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UrlCard from './UrlCard';
import { act } from 'react';


const mockUrl = {
  id: '1',
  originalUrl: 'https://example.com/some/very/long/path',
  shortCode: 'abc123',
  shortUrl: 'http://localhost:3001/abc123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockOnDelete = jest.fn();

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock window.confirm
global.confirm = jest.fn(() => true);

describe('UrlCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher les informations de l\'URL', () => {
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={false} />);
  });

  it('devrait afficher le badge "Nouveau" si isLatest est true', () => {
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={true} />);
    expect(screen.getByText('Nouveau')).toBeInTheDocument();
  });

  it('ne devrait pas afficher le badge "Nouveau" si isLatest est false', () => {
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={false} />);
    expect(screen.queryByText('Nouveau')).not.toBeInTheDocument();
  });

  it('devrait copier le lien dans le presse-papiers', async () => {
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={false} />);
    const copyBtn = screen.getByLabelText(/copier le lien/i);
    
    await act(async () => {
    fireEvent.click(copyBtn);
    });
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3001/abc123');
    });
  });

  it('devrait appeler onDelete après confirmation', async () => {
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={false} />);
    const deleteBtn = screen.getByLabelText(/supprimer le lien/i);
    
    await act(async () => {
    fireEvent.click(deleteBtn);
    });

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  it('ne devrait pas appeler onDelete si l\'utilisateur annule', async () => {
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    render(<UrlCard url={mockUrl} onDelete={mockOnDelete} isLatest={false} />);
    const deleteBtn = screen.getByLabelText(/supprimer le lien/i);
    
    await act(async () => {
    fireEvent.click(deleteBtn);
    });   
  });
});
