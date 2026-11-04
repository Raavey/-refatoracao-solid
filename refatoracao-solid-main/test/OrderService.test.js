const test = require("node:test");
const assert = require("node:assert/strict");
const Address = require("../src/domain/Address");
const Customer = require("../src/domain/Customer");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const ProductRepository = require("../src/repositories/ProductRepository");
const OrderRepository = require("../src/repositories/OrderRepository");
const OrderService = require("../src/services/OrderService");

function createOrder(paymentMethod = "credit_card") {
  const products = new ProductRepository();
  const customer = new Customer(
    "c1",
    "Ana Souza",
    "ana.souza@example.com",
    "18999990000",
    "vip",
    new Address("Rua das Palmeiras", "120", "Presidente Prudente", "SP", "19000-000", "sudeste")
  );

  return {
    products,
    order: new Order(
      "o1001",
      customer,
      [
        new OrderItem(products.findById("p1"), 1),
        new OrderItem(products.findById("p2"), 2)
      ],
      "TECH10",
      paymentMethod,
      3
    )
  };
}

function createService(products, notifications = [], warnings = []) {
  return new OrderService({
    productRepository: products,
    orderRepository: new OrderRepository(),
    notificationService: {
      sendOrderConfirmation: (...args) => notifications.push(args)
    },
    logger: {
      info() {},
      warn: (message) => warnings.push(message)
    },
    reporter: { report() {} }
  });
}

test("processes a credit card order and updates stock", () => {
  const { products, order } = createOrder();
  const notifications = [];
  const result = createService(products, notifications).process(order);

  assert.equal(result.subtotal, 6440);
  assert.equal(result.discount, 1159.2);
  assert.equal(result.freight, 30);
  assert.equal(result.paymentFee, 161);
  assert.equal(result.total, 5471.8);
  assert.equal(result.status, "confirmed");
  assert.equal(products.findById("p1").stock, 7);
  assert.equal(products.findById("p2").stock, 28);
  assert.equal(notifications.length, 1);
});

test("keeps boleto orders waiting for payment", () => {
  const { products, order } = createOrder("boleto");
  const notifications = [];
  const warnings = [];
  const result = createService(products, notifications, warnings).process(order);

  assert.equal(result.status, "waiting_payment");
  assert.equal(result.paymentFee, 0);
  assert.equal(notifications.length, 0);
  assert.equal(warnings.length, 1);
});

test("rejects invalid quantities before changing stock", () => {
  const { products, order } = createOrder();
  order.items[0].quantity = 0;

  assert.throws(
    () => createService(products).process(order),
    { message: "Quantidade invalida." }
  );
  assert.equal(products.findById("p1").stock, 8);
});

test("rejects unsupported payment methods", () => {
  const { products, order } = createOrder("transfer");

  assert.throws(
    () => createService(products).process(order),
    { message: "Forma de pagamento invalida." }
  );
  assert.equal(products.findById("p1").stock, 8);
});
