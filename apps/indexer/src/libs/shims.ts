declare global {
  interface BigInt {
    toJSON(): string;
    toNumber(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

BigInt.prototype.toNumber = function () {
  return Number(this);
};
