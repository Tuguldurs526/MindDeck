process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || "*";
// Force local stub for LLM calls during tests
process.env.OPENAI_MOCK = "1";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "test-key";
