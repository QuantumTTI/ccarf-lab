// In-memory data store shared by all routes.
let nextCustomerId = 1;
let nextOrderId = 1;
let nextRefundId = 1;

const customers = new Map();
const orders = new Map();
const refunds = new Map();

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function addCustomer({ name, email }) {
  const id = nextCustomerId++;
  const customer = { id, name, email };
  customers.set(id, customer);
  return customer;
}

function addOrder({ customerId, amountCents }) {
  if (!customers.has(customerId)) {
    throw new Error(`unknown customer ${customerId}`);
  }
  const id = nextOrderId++;
  const order = { id, customerId, amountCents, refundedCents: 0 };
  orders.set(id, order);
  return order;
}

function addRefund({ orderId, amountCents }) {
  const order = orders.get(orderId);
  if (!order) {
    throw new Error(`unknown order ${orderId}`);
  }
  if (order.refundedCents + amountCents > order.amountCents) {
    throw new Error(`refund exceeds order total`);
  }
  order.refundedCents += amountCents;
  const id = nextRefundId++;
  const refund = { id, orderId, amountCents };
  refunds.set(id, refund);
  return refund;
}

module.exports = {
  customers,
  orders,
  refunds,
  formatCurrency,
  addCustomer,
  addOrder,
  addRefund,
};
