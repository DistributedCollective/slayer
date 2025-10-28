import { formatUnits } from 'viem';

export type BigNumberish = string | Numeric;

export type Decimalish = Decimal | number | string | bigint;
export type Numeric = number | bigint | Decimalish;

// const getDigits = (numDigits: number) => TEN.pow(numDigits);

const MAX_UINT_256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const DEFAULT_PRECISION = 18;
// const ONE = BigNumber.from(1);
// const TEN = BigNumber.from(10);
// const DIGITS = getDigits(PRECISION);

const stringRepresentationFormat = /^(-)?[0-9]*(\.[0-9]*)?(e[-+]?[0-9]+)?$/;
// const trailingZeros = /0*$/;
// const magnitudes = ['', 'K', 'M', 'B', 'T'];

// const roundedMul = (x: bigint, y: bigint) =>
//   x.mul(y).add(Decimal.HALF.toHexString()).div(DIGITS);

export class Decimal {
  static readonly INFINITY = new Decimal(BigInt(MAX_UINT_256), 0);

  private readonly _bigInt: bigint;
  private readonly _decimals: number;

  private constructor(value: bigint, decimals: number = DEFAULT_PRECISION) {
    // this._bigInt = value / 10n ** BigInt(0 >= decimals ? 0 : decimals);
    this._bigInt = value;
    this._decimals = decimals;
  }

  toBigInt(): bigint {
    return this._bigInt;
  }

  toString(): string {
    return formatUnits(this._bigInt, this._decimals);
  }

  static from(
    value: Decimalish,
    decimals: number = DEFAULT_PRECISION,
  ): Decimal {
    if (value instanceof Decimal) {
      return value;
    }
    if (typeof value === 'bigint') {
      return new Decimal(value, decimals);
    }
    if (typeof value === 'number') {
      return Decimal._fromString(value.toString(), decimals);
    }
    if (typeof value === 'string') {
      return Decimal._fromString(value, decimals);
    }
    throw new Error(`cannot convert to Decimal: ${value}`);
  }

  static _fromString(
    representation: string,
    decimals: number = DEFAULT_PRECISION,
  ): Decimal {
    if (representation === 'Infinity') {
      return Decimal.INFINITY;
    }

    if (!representation || !representation.match(stringRepresentationFormat)) {
      throw new Error(`bad decimal format: "${representation}"`);
    }

    if (representation.includes('e')) {
      // eslint-disable-next-line prefer-const
      let [coefficient, exponent] = representation.split('e');

      if (exponent.startsWith('-')) {
        return new Decimal(
          BigInt(coefficient) / 10n ** BigInt(exponent.substr(1)),
        );
      }

      if (exponent.startsWith('+')) {
        exponent = exponent.substr(1);
      }

      return new Decimal(
        BigInt(coefficient) * 10n ** BigInt(exponent),
        decimals,
      );
    }

    if (!representation.includes('.')) {
      return new Decimal(
        BigInt(representation) * 10n ** BigInt(decimals),
        decimals,
      );
    }

    // eslint-disable-next-line prefer-const
    let [characteristic, mantissa] = representation.split('.');

    if (mantissa.length < decimals) {
      mantissa += '0'.repeat(decimals - mantissa.length);
    } else {
      mantissa = mantissa.substr(0, decimals);
    }

    return new Decimal(
      BigInt(characteristic || '0') * 10n ** BigInt(decimals) +
        BigInt(mantissa),
      decimals,
    );
  }

  // math
  add(other: Decimalish): Decimal {
    const o = Decimal.from(other, this._decimals);
    return new Decimal(this._bigInt + o._bigInt, this._decimals);
  }

  sub(other: Decimalish): Decimal {
    const o = Decimal.from(other, this._decimals);
    return new Decimal(this._bigInt - o._bigInt, this._decimals);
  }

  mul(other: Decimalish): Decimal {
    const o = Decimal.from(other, this._decimals);
    return new Decimal(
      (this._bigInt * o._bigInt) / 10n ** BigInt(this._decimals),
      this._decimals,
    );
  }

  div(other: Decimalish): Decimal {
    const o = Decimal.from(other, this._decimals);
    return new Decimal(
      (this._bigInt * 10n ** BigInt(this._decimals)) / o._bigInt,
      this._decimals,
    );
  }

  neg(): Decimal {
    return new Decimal(-this._bigInt, this._decimals);
  }

  abs(): Decimal {
    return this._bigInt < 0n ? this.neg() : this;
  }

  // comparisons
  eq(other: Decimalish): boolean {
    const o = Decimal.from(other, this._decimals);
    return this._bigInt === o._bigInt;
  }

  lt(other: Decimalish): boolean {
    const o = Decimal.from(other, this._decimals);
    return this._bigInt < o._bigInt;
  }

  lte(other: Decimalish): boolean {
    const o = Decimal.from(other, this._decimals);
    return this._bigInt <= o._bigInt;
  }

  gt(other: Decimalish): boolean {
    const o = Decimal.from(other, this._decimals);
    return this._bigInt > o._bigInt;
  }

  gte(other: Decimalish): boolean {
    const o = Decimal.from(other, this._decimals);
    return this._bigInt >= o._bigInt;
  }

  // utilities
  isZero(): boolean {
    return this._bigInt === 0n;
  }

  isPositive(): boolean {
    return this._bigInt > 0n;
  }

  isNegative(): boolean {
    return this._bigInt < 0n;
  }

  isInteger(): boolean {
    return this._bigInt % 10n ** BigInt(this._decimals) === 0n;
  }

  getDecimals(): number {
    return this._decimals;
  }

  static max(items: Decimalish[]): Decimal {
    if (items.length === 0) {
      throw new Error('cannot get max of empty array');
    }
    let max = Decimal.from(items[0]);
    for (let i = 1; i < items.length; i++) {
      const d = Decimal.from(items[i], max._decimals);
      if (d.gt(max)) {
        max = d;
      }
    }
    return max;
  }

  static min(items: Decimalish[]): Decimal {
    if (items.length === 0) {
      throw new Error('cannot get min of empty array');
    }
    let min = Decimal.from(items[0]);
    for (let i = 1; i < items.length; i++) {
      const d = Decimal.from(items[i], min._decimals);
      if (d.lt(min)) {
        min = d;
      }
    }
    return min;
  }
}
