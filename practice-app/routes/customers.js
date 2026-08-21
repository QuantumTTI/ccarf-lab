const express = require('express');
const { customers, addCustomer } = require('../store');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Array.from(customers.values()));
});

router.get('/:id', (req, res) => {
  const customer = customers.get(Number(req.params.id));
  if (!customer) return res.status(404).json({ error: 'not found' });
  res.json(customer);
});

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email required' });
  }
  res.status(201).json(addCustomer({ name, email }));
});

module.exports = router;
