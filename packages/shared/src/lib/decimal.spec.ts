import { Decimal } from './decimal.js';

describe('decimal.js', () => {
  describe('number input', () => {
    it('creates a Decimal from a number (18)', () => {
      const d = Decimal.from(1.5);
      expect(d.toString()).toBe('1.5');
      expect(String(d)).toBe('1.5');
      expect(d.toBigInt()).toBe(1500000000000000000n);
    });

    it('creates a Decimal from a number (8)', () => {
      const d = Decimal.from(10, 8);
      expect(d.toString()).toBe('10');
      expect(String(d)).toBe('10');
      expect(d.toBigInt()).toBe(1000000000n);
    });

    it('creates a Decimal from a number (1)', () => {
      const d = Decimal.from(1.9, 1);
      expect(d.toString()).toBe('1.9');
      expect(String(d)).toBe('1.9');
      expect(d.toBigInt()).toBe(19n);
    });

    it('creates a Decimal from a number (0)', () => {
      const d = Decimal.from(5, 0);
      expect(d.toString()).toBe('5');
      expect(String(d)).toBe('5');
      expect(d.toBigInt()).toBe(5n);
    });
  });

  describe('string input', () => {
    it('creates a Decimal from a string (18)', () => {
      const d = Decimal.from('2.5');
      expect(d.toString()).toBe('2.5');
      expect(String(d)).toBe('2.5');
      expect(d.toBigInt()).toBe(2500000000000000000n);
    });

    it('creates a Decimal from a string (6)', () => {
      const d = Decimal.from('0.000015', 6);
      expect(d.toString()).toBe('0.000015');
      expect(String(d)).toBe('0.000015');
      expect(d.toBigInt()).toBe(15n);
    });

    it('creates a Decimal with trimmed away invalid decimals (6)', () => {
      const d = Decimal.from('0.0000015', 6);
      expect(d.toString()).toBe('0.000001');
      expect(String(d)).toBe('0.000001');
      expect(d.toBigInt()).toBe(1n);
    });

    it('creates a Decimal from a string (0)', () => {
      const d = Decimal.from('123', 0);
      expect(d.toString()).toBe('123');
      expect(String(d)).toBe('123');
      expect(d.toBigInt()).toBe(123n);
    });
  });

  describe('bigint input', () => {
    it('creates a Decimal from a bigint (18)', () => {
      const d = Decimal.from(3000000000000000000n);
      expect(d.toString()).toBe('3');
      expect(String(d)).toBe('3');
      expect(d.toBigInt()).toBe(3000000000000000000n);
    });

    it('creates a Decimal from a bigint (4)', () => {
      const d = Decimal.from(12345n, 4);
      expect(d.toString()).toBe('1.2345');
      expect(String(d)).toBe('1.2345');
      expect(d.toBigInt()).toBe(12345n);
    });

    it('creates a Decimal from a bigint (1)', () => {
      const d = Decimal.from(12345n, 1);
      expect(d.toString()).toBe('1234.5');
      expect(String(d)).toBe('1234.5');
      expect(d.toBigInt()).toBe(12345n);
    });

    it('creates a Decimal from a bigint (0)', () => {
      const d = Decimal.from(12345n, 0);
      expect(d.toString()).toBe('12345');
      expect(String(d)).toBe('12345');
      expect(d.toBigInt()).toBe(12345n);
    });
  });

  describe('Infinity', () => {
    it('creates a Decimal from string Infinity', () => {
      const d = Decimal.from('Infinity', 0);
      expect(d.toString()).toBe(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      );
      expect(String(d)).toBe(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      );
      expect(d.toBigInt()).toBe(
        115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      );
    });

    it('creates a Decimal from bigint MAX_UINT_256', () => {
      const d = Decimal.from(
        BigInt(
          '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        ),
        0,
      );
      expect(d.toString()).toBe(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      );
      expect(String(d)).toBe(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      );
      expect(d.toBigInt()).toBe(
        115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      );
    });
  });

  // it('resolves decimal to bignumber', () => {
  //   const d = Decimal.from('1');
  //   expect(d.toBigNumber().toString()).toBe('1000000000000000000');
  // });

  // it('creates a Decimal from a BigNumber', () => {
  //   const d = Decimal.fromBigNumberString('1');
  //   expect(d.toString()).toBe('0.000000000000000001');
  // });

  // it('resolves decimal to bignumber', () => {
  //   const d = Decimal.fromBigNumberString('1');
  //   expect(d.toBigNumber().toString()).toBe('1');
  // });

  // it('creates a Decimal from scientific strings', () => {
  //   const d = Decimal.from('1e-18');
  //   expect(d.toString()).toBe('0.000000000000000001');
  // });

  // it('cant create a Decimal from larger scientific strings', () => {
  //   const d = Decimal.from('1e-19');
  //   expect(d.toString()).toBe('0');
  // });

  // describe('as a number', () => {
  //   it('can render number', () => {
  //     const d = Decimal.from('1');
  //     expect(d.toNumber()).toBe(1);
  //     expect(Number(d)).toBe(1);
  //   });

  //   it('can render a number from bignumber', () => {
  //     const d = Decimal.fromBigNumberString('1');
  //     expect(d.toNumber()).toBe(1e-18);
  //   });

  //   it('can render a number from bignumber too', () => {
  //     const d = Decimal.fromBigNumberString('10000000000000');
  //     expect(d.toNumber()).toBe(0.00001);
  //   });
  // });

  // describe('min & max', () => {
  //   it('can find the min', () => {
  //     const d = Decimal.min(
  //       Decimal.from('1'),
  //       Decimal.from('2'),
  //       Decimal.from('0.4'),
  //     );
  //     expect(d.toString()).toBe('0.4');
  //   });

  //   it('can find the max', () => {
  //     const d = Decimal.max(
  //       Decimal.from('1'),
  //       Decimal.from('2'),
  //       Decimal.from('0.4'),
  //     );
  //     expect(d.toString()).toBe('2');
  //   });
  // });

  // describe('negative', () => {
  //   it('number can be negative', () => {
  //     const d = Decimal.from(-1);
  //     expect(d.toString()).toBe('-1');
  //   });
  //   it('number can be negative', () => {
  //     const d = Decimal.from(-1);
  //     expect(d.toString(5)).toBe('-1.00000');
  //   });
  //   it('bignumber renders negative values on automatic precision', () => {
  //     const d = Decimal.fromBigNumberString('-1');
  //     expect(d.toString()).toBe('-0.000000000000000001');
  //   });

  //   it('bignumber renders negative values on custom precision (18)', () => {
  //     const d = Decimal.fromBigNumberString('-100');
  //     expect(d.toString(18)).toBe('-0.000000000000000100');
  //   });

  //   it('bignumber renders negative values on custom precision (14)', () => {
  //     const d = Decimal.fromBigNumberString('-10000');
  //     expect(d.toString(14)).toBe('-0.00000000000001');
  //   });
  // });
});
