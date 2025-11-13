import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock services to avoid real network calls
jest.mock('../../services/api', () => ({
  productsAPI: {
    getAll: jest.fn(() => Promise.resolve([])),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
  },
  categoriesAPI: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

import ProductManagement from './ProductManagement';

describe('ProductManagement (smoke tests)', () => {
  test('renders heading and initial controls', async () => {
    render(<ProductManagement />);

    expect(screen.getByText(/Product Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage your dental inventory products/i)).toBeInTheDocument();

    // Wait for possible async fetches to settle
    await waitFor(() => expect(true).toBe(true));
  });
});
