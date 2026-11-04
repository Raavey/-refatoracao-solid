class NotificationService {
  constructor(sender = console.log) {
    this.sender = sender;
  }

  sendOrderConfirmation(customer, orderId, total) {
    this.sender(
      `Pedido ${orderId} confirmado para ${customer.email}. Total: R$ ${total.toFixed(2)}`
    );
  }
}

module.exports = NotificationService;
