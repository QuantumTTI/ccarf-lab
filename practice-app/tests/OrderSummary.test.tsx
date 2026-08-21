import { render, screen } from '@testing-library/react';
import { OrderSummary } from '../components/OrderSummary';

test('shows remaining balance after a partial refund', () => {
  const order = { id: 7, amountCents: 5000, refundedCents: 1200 };
  render(<OrderSummary order={order} />);
  expect(screen.getByText('Remaining: $38.00')).toBeInTheDocument();
});

test('shows zero refunded by default', () => {
  const order = { id: 8, amountCents: 2000, refundedCents: 0 };
  render(<OrderSummary order={order} />);
  expect(screen.getByText('Refunded: $0.00')).toBeInTheDocument();
});
