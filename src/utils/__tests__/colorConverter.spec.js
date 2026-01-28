import { describe, it, expect } from 'vitest';
import { germanColorToHex } from '../colorConverter';

describe('colorConverter', () => {
    describe('germanColorToHex', () => {
        it('should convert known German colors to hex', () => {
            expect(germanColorToHex('rot')).toBe('#FF0000');
            expect(germanColorToHex('Blau')).toBe('#0000FF'); // Case insensitivity
            expect(germanColorToHex('grün')).toBe('#008000');
            expect(germanColorToHex('weiß')).toBe('#FFFFFF');
            expect(germanColorToHex('weiss')).toBe('#FFFFFF');
        });

        it('should handle variations of colors', () => {
            expect(germanColorToHex('hellblau')).toBe('#ADD8E6');
            expect(germanColorToHex('dunkelrot')).toBe('#8B0000');
        });

        it('should throw an error for unknown colors', () => {
            expect(() => germanColorToHex('unsichtbar')).toThrow('Unbekannte Farbe: unsichtbar');
        });

        it('should throw an error for empty strings', () => {
            expect(() => germanColorToHex('')).toThrow();
        });
    });
});
