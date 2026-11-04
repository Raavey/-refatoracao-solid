const ProductRepository = require("../repositories/ProductRepository");
const OrderRepository = require("../repositories/OrderRepository");
const NotificationService = require("./NotificationService");
const Logger = require("../utils/Logger");
const DiscountCalculator = require("./DiscountCalculator");
const FreightCalculator = require("./FreightCalculator");
const PaymentProcessor = require("./PaymentProcessor");
const OrderValidator = require("./OrderValidator");
const OrderSummaryBuilder = require("./OrderSummaryBuilder");
const OrderReporter = require("./OrderReporter");

class OrderService {
  constructor({
    productRepository = new ProductRepository(),
    orderRepository = new OrderRepository(),
    notificationService = new NotificationService(),
    logger = new Logger(),
    validator = new OrderValidator(),
    discountCalculator = new DiscountCalculator(),
    freightCalculator = new FreightCalculator(),
    paymentProcessor = new PaymentProcessor(),
    summaryBuilder = new OrderSummaryBuilder(),
    reporter = new OrderReporter()
  } = {}) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.notificationService = notificationService;
    this.logger = logger;
    this.validator = validator;
    this.discountCalculator = discountCalculator;
    this.freightCalculator = freightCalculator;
    this.paymentProcessor = paymentProcessor;
    this.summaryBuilder = summaryBuilder;
    this.reporter = reporter;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);
    this.validator.validate(order, this.productRepository);

    const subtotal = order.getSubtotal();
    const discount =
      this.discountCalculator.calculate(order, subtotal);
    const freight = this.freightCalculator.calculate(order);
    const payment = this.paymentProcessor.process(order, subtotal);
    const total = Number(
      (subtotal - discount - payment.discount + freight + payment.fee).toFixed(2)
    );

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    for (const item of order.items) {
      this.productRepository.updateStock(item.product.id, item.quantity);
    }

    order.status =
      payment.status === "approved" ? "confirmed" : "waiting_payment";
    const summary = this.summaryBuilder.build(order, {
      subtotal,
      discount: discount + payment.discount,
      freight,
      paymentFee: payment.fee,
      total
    });

    this.orderRepository.save(summary);

    if (order.status === "confirmed") {
      this.notificationService.sendOrderConfirmation(
        order.customer,
        order.id,
        total
      );
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }

    this.reporter.report(order, summary);
    return summary;
  }
}

module.exports = OrderService;
