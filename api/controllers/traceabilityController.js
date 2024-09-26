require('dotenv').config({ path: './config/.env' });

exports.getProduct = async (req, res) => {
  try {
    const result =
      await req.blockchain.traceabilityContract.evaluateTransaction(
        'getProduct',
        req.query.productId
      );
    res.send(result.toString());
  } catch (error) {
    console.error(`Failed to get product: ${error}`);
    res.status(500).send({ error: 'Failed to get product' });
  }
};

exports.addEvent = async (req, res) => {
  try {
    await req.blockchain.traceabilityContract.submitTransaction(
      'onEvent',
      JSON.stringify(req.body)
    );
    res.send(true);
  } catch (error) {
    console.error(`Failed to register event: ${error}`);
    res.status(500).send({ error });
  }
};

exports.checkProductList = async (req, res) => {
  try {
    const result = await req.blockchain.traceabilityContract.evaluateTransaction(
      'checkProductList',
      req.query.productList
    );
    res.send(result);
  } catch (error) {
    console.error('Failed to query product list:', error);
    res.status(500).send({ error });
  }
}