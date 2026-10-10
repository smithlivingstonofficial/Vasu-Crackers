import { PricingService } from '../lib/services/pricing.service';

describe('PricingService Server-Authoritative Price Calculation', () => {
  it('should accurately calculate subtotal and delivery fee for South India zone (including Tamil Nadu)', () => {
    const result = PricingService.calculateOrderPricing(
      [
        { product_id: 'prod-4', quantity: 3 }, // 3 x 480 = 1440
        { product_id: 'prod-9', quantity: 4 }, // 4 x 890 = 3560
      ],
      'Tamil Nadu'
    );

    expect(result.subtotal).toBe(5000); // 1440 + 3560
    expect(result.isMinOrderMet).toBe(true); // 5000 >= 4000
    expect(result.deliveryFee).toBe(150); // South India delivery fee
    expect(result.grandTotal).toBe(5150);
  });

  it('should detect when subtotal is below minimum threshold', () => {
    const result = PricingService.calculateOrderPricing(
      [{ product_id: 'prod-1', quantity: 2 }], // 2 x 150 = 300
      'Tamil Nadu'
    );

    expect(result.subtotal).toBe(300);
    expect(result.isMinOrderMet).toBe(false); // 300 < 4000
  });
});
