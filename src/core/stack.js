export function captureStack({ skip = 2, limit = 12 } = {}) {
  const stack = new Error().stack?.split('\n').slice(1 + skip, 1 + skip + limit) ?? [];
  return stack.map(line => line.trim());
}
