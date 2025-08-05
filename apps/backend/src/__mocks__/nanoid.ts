// Mock implementation of nanoid for testing
export const nanoid = jest.fn().mockImplementation((length: number = 7) => {
  return "a".repeat(length);
});

export const customAlphabet = jest
  .fn()
  .mockImplementation((alphabet: string, length: number) => {
    return jest.fn().mockReturnValue("a".repeat(length));
  });
