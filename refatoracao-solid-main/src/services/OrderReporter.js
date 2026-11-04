class OrderReporter {
  constructor(output = console.log) {
    this.output = output;
  }

  report(order, summary) {
    this.output("Resumo do pedido");
    this.output(`Cliente: ${order.customer.name}`);
    this.output(`Cidade: ${order.getCustomerLocation()}`);
    this.output(`Itens: ${order.getTotalItems()}`);
    this.output(`Subtotal: R$ ${summary.subtotal.toFixed(2)}`);
    this.output(`Desconto: R$ ${summary.discount.toFixed(2)}`);
    this.output(`Frete: R$ ${summary.freight.toFixed(2)}`);
    this.output(`Taxas: R$ ${summary.paymentFee.toFixed(2)}`);
    this.output(`Total: R$ ${summary.total.toFixed(2)}`);
  }
}

module.exports = OrderReporter;
