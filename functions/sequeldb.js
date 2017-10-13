class SequelProvider  {
  constructor(client, name) {
    this.client = client;
    this.type = name.toLowerCase().slice(0, -1);
  }
}
module.exports = SequelProvider;