class OrderValidator {
  validate(order, productRepository) {
    if (!order.customer) {
      throw new Error("Cliente obrigatorio.");
    }

    if (!order.customer.hasValidEmail()) {
      throw new Error("E-mail do cliente invalido.");
    }

    if (!order.items || order.items.length === 0) {
      throw new Error("Pedido sem itens.");
    }

    for (const item of order.items) {
      if (!item.product) {
        throw new Error("Item sem produto.");
      }

      if (item.quantity <= 0) {
        throw new Error("Quantidade invalida.");
      }

      const product = productRepository.findById(item.product.id);
      if (!product) {
        throw new Error(`Produto ${item.product.id} nao encontrado.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}.`);
      }
    }
  }
}

module.exports = OrderValidator;
