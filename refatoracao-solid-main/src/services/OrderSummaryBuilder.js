class OrderSummaryBuilder {
  build(order, totals) {
    return {
      id: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      city: order.customer.address.city,
      state: order.customer.address.state,
      items: order.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        subtotal: item.getSubtotal()
      })),
      subtotal: totals.subtotal,
      discount: Number(totals.discount.toFixed(2)),
      freight: Number(totals.freight.toFixed(2)),
      paymentFee: Number(totals.paymentFee.toFixed(2)),
      total: totals.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt
    };
  }
}

module.exports = OrderSummaryBuilder;
