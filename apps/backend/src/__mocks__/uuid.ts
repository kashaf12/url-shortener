// Mock implementation of uuid for testing
export const v4 = jest
  .fn()
  .mockReturnValue("12345678-1234-1234-1234-123456789012");
export const v7 = jest
  .fn()
  .mockReturnValue("12345678-1234-7000-8000-123456789012");
