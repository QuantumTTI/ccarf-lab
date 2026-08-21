import React from 'react';

function formatDisplayAmount(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function OrderSummary({ order }) {
  const remaining = order.amountCents - order.refundedCents;
  return (
    <div className="order-summary">
      <span>Order #{order.id}</span>
      <span>{formatDisplayAmount(order.amountCents)}</span>
      <span>Refunded: {formatDisplayAmount(order.refundedCents)}</span>
      <span>Remaining: {formatDisplayAmount(remaining)}</span>
    </div>
  );
}
