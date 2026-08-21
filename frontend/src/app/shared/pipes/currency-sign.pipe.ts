import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom pipe to format decimal numbers as standardized currency strings.
 * E.g., `1234.5` -> `$1,234.50`
 */
@Pipe({
  name: 'currencySign',
  standalone: true
})
export class CurrencySignPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSignPrefix = false): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '$0.00';
    }

    const num = Number(value);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(num));

    if (showSignPrefix) {
      if (num > 0) return `+${formatted}`;
      if (num < 0) return `-${formatted}`;
    }

    return num < 0 ? `-${formatted}` : formatted;
  }
}
