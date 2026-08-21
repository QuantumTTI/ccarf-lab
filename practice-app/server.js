const express = require('express');
const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const refundsRouter = require('./routes/refunds');

const app = express();
app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/refunds', refundsRouter);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`practice-app listening on ${PORT}`));
}

module.exports = app;
