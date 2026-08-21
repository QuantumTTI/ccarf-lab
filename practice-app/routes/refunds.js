const express = require('express');
const { refunds, addRefund, formatCurrency } = require('../store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Array.from(refunds.values()).map(withTotals));
});

router.post('/', (req, res) => {
  const { orderId, amountCents } = req.body;
  if (!orderId || !amountCents) {
    return res.status(400).json({ error: 'orderId and amountCents required' });
  }
  try {
    res.status(201).json(withTotals(addRefund({ orderId, amountCents })));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function withTotals(refund) {
  return { ...refund, amountFormatted: formatCurrency(refund.amountCents) };
}

module.exports = router;
