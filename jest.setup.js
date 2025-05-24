// Add Jest extended matchers
import '@testing-library/jest-dom';

// Mock next/router
import { useRouter } from 'next/router';
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next/navigation
import { useSearchParams, useParams, usePathname, useRouter as useNextRouter } from 'next/navigation';
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

// Setup default mocks
beforeEach(() => {
  // Reset useRouter mock
  useRouter.mockImplementation(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }));
});

// Silence console errors during tests
jest.spyOn(console, 'error').mockImplementation(() => {}); 