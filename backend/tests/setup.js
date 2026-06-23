process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/turismo_test';
process.env.JWT_SECRET = 'segredo_de_testes_32_caracteres_min';
process.env.JWT_EXPIRATION = '1h';
process.env.SMTP_HOST = 'localhost';
process.env.EMAIL_SEMSET = 'semset@test.com';
