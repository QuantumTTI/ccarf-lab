import { render, screen } from '@testing-library/react';
import { CustomerList } from './CustomerList';

test('renders empty state', () => {
  render(<CustomerList customers={[]} />);
  expect(screen.getByText('No customers yet.')).toBeInTheDocument();
});

test('renders a customer row', () => {
  render(<CustomerList customers={[{ id: 1, name: 'Ada', email: 'ada@example.com' }]} />);
  expect(screen.getByText('Ada <ada@example.com>')).toBeInTheDocument();
});
