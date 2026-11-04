class FreightCalculator {
  calculate(order) {
    const rates = {
      sudeste: [20, 4],
      sul: [28, 5],
      "centro-oeste": [35, 6],
      nordeste: [45, 7],
      norte: [60, 9]
    };
    const [base, perWeight] = rates[order.customer.address.region] || [50, 8];
    const freight = base + order.getTotalWeight() * perWeight;

    return order.couponCode === "FRETEGRATIS" ? 0 : freight;
  }
}

module.exports = FreightCalculator;
