import { Decimal as D } from 'decimal.js';

export type BigNumberish = string | Numeric;

export type Decimalish = Decimal | number | string | bigint;
export type Numeric = number | bigint | Decimalish;

D.set({
  precision: 72,
  rounding: D.ROUND_DOWN,
});

const DEFAULT_PRECISION = 18;
const MAX_UINT_256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const stringRepresentationFormat = /^(-)?[0-9]*(\.[0-9]*)?(e[-+]?[0-9]+)?$/;
export class Decimal {
  readonly precision: number;
  readonly d: D;

  static ZERO = new Decimal('0');
  static ONE = new Decimal('1');
  static INFINITY = new Decimal('Infinity', 0);

  constructor(value: string, precision: number = DEFAULT_PRECISION) {
    this.d = new D(value);
    this.precision = precision;
  }

  static from(
    value: Decimalish,
    precision: number = DEFAULT_PRECISION,
  ): Decimal {
    if (value instanceof Decimal) {
      return value;
    }

    if (typeof value === 'number') {
      return new Decimal(value.toString(), precision);
    }

    if (typeof value === 'string') {
      if (value === 'Infinity') {
        return new Decimal(MAX_UINT_256, 0);
      }

      if (!stringRepresentationFormat.test(value)) {
        throw new Error(`Invalid decimal string representation: ${value}`);
      }
      return new Decimal(value, precision);
    }

    if (typeof value === 'bigint') {
      const v = new D(value.toString()).div(new D(10).pow(precision));
      return new Decimal(v.toString(), precision);
    }

    throw new Error(`Cannot convert to Decimal: ${value}`);
  }

  toBigInt(): bigint {
    return BigInt(this.d.mul(new D(10).pow(this.precision)).toFixed(0));
  }

  toString(decimalPlaces?: number): string {
    return this.d.toFixed(decimalPlaces);
  }

  toFixed(decimalPlaces: number): string {
    return this.d.toFixed(decimalPlaces);
  }

  toHex(digits?: number): string {
    return this.d.toHex(digits);
  }

  add(value: Decimalish, precision?: number): Decimal {
    return Decimal.from(
      this.d.add(Decimal.from(value, precision).d).toString(),
      this.precision,
    );
  }

  sub(value: Decimalish, precision?: number): Decimal {
    return Decimal.from(
      this.d.sub(Decimal.from(value, precision).d).toString(),
      this.precision,
    );
  }

  mul(value: Decimalish, precision?: number): Decimal {
    return Decimal.from(
      this.d.mul(Decimal.from(value, precision).d).toString(),
      this.precision,
    );
  }

  div(value: Decimalish, precision?: number): Decimal {
    return Decimal.from(
      this.d.div(Decimal.from(value, precision).d).toString(),
      this.precision,
    );
  }

  lt(value: Decimalish, precision?: number): boolean {
    return this.d.lt(Decimal.from(value, precision).d);
  }

  lte(value: Decimalish, precision?: number): boolean {
    return this.d.lte(Decimal.from(value, precision).d);
  }

  gt(value: Decimalish, precision?: number): boolean {
    return this.d.gt(Decimal.from(value, precision).d);
  }

  gte(value: Decimalish, precision?: number): boolean {
    return this.d.gte(Decimal.from(value, precision).d);
  }

  eq(value: Decimalish, precision?: number): boolean {
    return this.d.eq(Decimal.from(value, precision).d);
  }

  isZero(): boolean {
    return this.d.isZero();
  }

  isPositive(): boolean {
    return this.d.isPositive();
  }

  isNegative(): boolean {
    return this.d.isNegative();
  }

  abs(): Decimal {
    return Decimal.from(this.d.abs().toString(), this.precision);
  }

  neg(): Decimal {
    return Decimal.from(this.d.neg().toString(), this.precision);
  }

  sqrt(): Decimal {
    return Decimal.from(this.d.sqrt().toString(), this.precision);
  }

  pow(value: Decimalish, precision?: number): Decimal {
    return Decimal.from(
      this.d.pow(Decimal.from(value, precision).d).toString(),
      this.precision,
    );
  }

  static min(...values: Decimalish[]): Decimal {
    return values
      .map((v) => Decimal.from(v))
      .reduce((min, curr) => (curr.lt(min) ? curr : min));
  }

  static max(...values: Decimalish[]): Decimal {
    return values
      .map((v) => Decimal.from(v))
      .reduce((max, curr) => (curr.gt(max) ? curr : max));
  }

  static sum(...values: Decimalish[]): Decimal {
    return values
      .map((v) => Decimal.from(v))
      .reduce((sum, curr) => sum.add(curr), Decimal.ZERO);
  }
}
