const express = require('express');
const { orders, addOrder, formatCurrency } = require('../store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Array.from(orders.values()).map(withTotals));
});

router.get('/:id', (req, res) => {
  const order = orders.get(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(withTotals(order));
});

router.post('/', (req, res) => {
  const { customerId, amountCents } = req.body;
  if (!customerId || !amountCents) {
    return res.status(400).json({ error: 'customerId and amountCents required' });
  }
  try {
    res.status(201).json(withTotals(addOrder({ customerId, amountCents })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function withTotals(order) {
  return { ...order, amountFormatted: formatCurrency(order.amountCents) };
}

module.exports = router;
