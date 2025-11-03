import { Decimal } from './decimal.js';

describe('decimal', () => {
  describe('number', () => {
    it('creates a Decimal from number (18)', () => {
      const d = Decimal.from(2.5);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2500000000000000000n);
    });

    it('creates a Decimal from number (9)', () => {
      const d = Decimal.from(2.5, 9);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2500000000n);
    });

    it('creates a Decimal from number (1)', () => {
      const d = Decimal.from(2.5, 1);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(25n);
    });

    it('creates a Decimal from number (0)', () => {
      const d = Decimal.from(2.5, 0);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2n);
    });
  });

  describe('string', () => {
    it('creates a Decimal from string (18)', () => {
      const d = Decimal.from('2.5');
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2500000000000000000n);
    });

    it('creates a Decimal from string (9)', () => {
      const d = Decimal.from('2.5', 9);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2500000000n);
    });

    it('creates a Decimal from string (1)', () => {
      const d = Decimal.from('2.5', 1);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(25n);
    });

    it('creates a Decimal from string (0)', () => {
      const d = Decimal.from('2.5', 0);
      expect(d.toString()).toBe('2.5');
      expect(d.toBigInt()).toBe(2n);
    });
  });

  describe('bigint', () => {
    it('creates a Decimal from bigint (18)', () => {
      const d = Decimal.from(3000000000000000000n);
      expect(d.toString()).toBe('3');
      expect(d.toBigInt()).toBe(3000000000000000000n);
    });

    it('creates a Decimal from bigint (4)', () => {
      const d = Decimal.from(12345n, 4);
      expect(d.toString()).toBe('1.2345');
      expect(d.toBigInt()).toBe(12345n);
    });

    it('creates a Decimal from bigint (1)', () => {
      const d = Decimal.from(12345n, 1);
      expect(d.toString()).toBe('1234.5');
      expect(d.toBigInt()).toBe(12345n);
    });

    it('creates a Decimal from bigint (0)', () => {
      const d = Decimal.from(12345n, 0);
      expect(d.toString()).toBe('12345');
      expect(d.toBigInt()).toBe(12345n);
    });
  });

  describe('infinity', () => {
    it('creates a Decimal from string "Infinity" and returns numeric string', () => {
      const d = Decimal.from('Infinity');
      expect(d.toString()).toBe(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      );
    });

    it('creates a Decimal from string "Infinity" and returns hex string', () => {
      const d = Decimal.from('Infinity');
      expect(d.toHex()).toBe(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      );
    });
  });

  describe('artithmetics', () => {
    it('adds two Decimals', () => {
      const a = Decimal.from('1.5');
      const b = Decimal.from('2.25');
      const c = a.add(b);
      expect(c.toString()).toBe('3.75');
    });

    it('multiplies two Decimals', () => {
      const a = Decimal.from('1.5');
      const b = Decimal.from('2.0');
      const c = a.mul(b);
      expect(c.toString()).toBe('3');
    });

    it('divides two Decimals', () => {
      const a = Decimal.from('3.0');
      const c = a.div('2.0');
      expect(c.toString()).toBe('1.5');
    });

    it('subtracts two Decimals', () => {
      const a = Decimal.from('3.0');
      const c = a.sub('2.25');
      expect(c.toString()).toBe('0.75');
    });

    it('compares two Decimals', () => {
      const a = Decimal.from('3.0');
      const b = Decimal.from('2.25');
      expect(a.gt(b)).toBe(true);
      expect(a.gte(b)).toBe(true);
      expect(a.lt(b)).toBe(false);
      expect(a.lte(b)).toBe(false);
    });

    describe('edge cases', () => {
      it('handles very small numbers', () => {
        const a = Decimal.from('0.000000000000000001');
        const b = Decimal.from('0.000000000000000002');
        const c = a.add(b);
        expect(c.toString()).toBe('0.000000000000000003');
      });

      it('handles very large numbers', () => {
        const a = Decimal.from('1e+30');
        const b = Decimal.from('2e+30');
        const c = a.add(b);
        expect(c.toString()).toBe('3000000000000000000000000000000');
      });
    });
  });
});
