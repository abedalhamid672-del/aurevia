import { describe, expect, it, vi } from "vitest";
import { createRateLimiter, securityHeaders } from "./_core/security";

function responseMock() {
  const headers = new Map<string, string>();
  return {
    headers,
    statusCode: 200,
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json: vi.fn(),
  };
}

describe("security middleware", () => {
  it("adds defensive response headers", () => {
    const res = responseMock();
    const next = vi.fn();
    securityHeaders()({} as never, res as never, next);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(next).toHaveBeenCalledOnce();
  });

  it("blocks requests after the configured budget", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1, name: "Test" });
    const req = { ip: "198.51.100.10", socket: { remoteAddress: "198.51.100.10" } };
    const first = responseMock();
    const firstNext = vi.fn();
    limiter(req as never, first as never, firstNext);
    expect(firstNext).toHaveBeenCalledOnce();

    const second = responseMock();
    const secondNext = vi.fn();
    limiter(req as never, second as never, secondNext);
    expect(secondNext).not.toHaveBeenCalled();
    expect(second.statusCode).toBe(429);
    expect(second.json).toHaveBeenCalledWith({ error: "Test rate limit exceeded" });
  });
});
