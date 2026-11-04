class Customer {
  constructor(id, name, email, phone, type, address) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.type = type;
    this.address = address;
  }

  hasValidEmail() {
    return Boolean(this.email && this.email.includes("@"));
  }

  getLocation() {
    return this.address.getLocation();
  }
}

module.exports = Customer;
