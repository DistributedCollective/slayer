import { formatUnits } from 'viem';

export type BigNumberish = string | Numeric;

export type Decimalish = Decimal | number | string;
export type Numeric = number | bigint | Decimalish;

// const getDigits = (numDigits: number) => TEN.pow(numDigits);

const MAX_UINT_256 =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const PRECISION = 18;
// const ONE = BigNumber.from(1);
// const TEN = BigNumber.from(10);
// const DIGITS = getDigits(PRECISION);

const stringRepresentationFormat = /^(-)?[0-9]*(\.[0-9]*)?(e[-+]?[0-9]+)?$/;
// const trailingZeros = /0*$/;
// const magnitudes = ['', 'K', 'M', 'B', 'T'];

// const roundedMul = (x: bigint, y: bigint) =>
//   x.mul(y).add(Decimal.HALF.toHexString()).div(DIGITS);

export class Decimal {
  static readonly INFINITY = new Decimal(BigInt(MAX_UINT_256));

  private readonly _bigInt: bigint;
  private readonly _decimals: number;

  private constructor(value: bigint) {
    this._bigInt = value;
    this._decimals = PRECISION;
  }

  toBigInt(): bigint {
    return this._bigInt;
  }

  toString(): string {
    return formatUnits(this._bigInt, this._decimals);
  }

  static from(value: Decimalish): Decimal {
    if (value instanceof Decimal) {
      return value;
    }
    if (typeof value === 'number') {
      return Decimal._fromString(value.toString());
    }
    if (typeof value === 'string') {
      return Decimal._fromString(value);
    }
    throw new Error(`cannot convert to Decimal: ${value}`);
  }

  static _fromString(representation: string): Decimal {
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

      return new Decimal(BigInt(coefficient) * 10n ** BigInt(exponent));
    }

    if (!representation.includes('.')) {
      return new Decimal(BigInt(representation) * 10n ** BigInt(PRECISION));
    }

    // eslint-disable-next-line prefer-const
    let [characteristic, mantissa] = representation.split('.');

    if (mantissa.length < PRECISION) {
      mantissa += '0'.repeat(PRECISION - mantissa.length);
    } else {
      mantissa = mantissa.substr(0, PRECISION);
    }

    return new Decimal(
      BigInt(characteristic || '0') * 10n ** BigInt(PRECISION) +
        BigInt(mantissa),
    );
  }
}
