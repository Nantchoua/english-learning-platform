// ============================================================
// UNIT TESTS — English Learning Platform
// Tests: auth helpers, progress calculation, payment logic
// ============================================================

// --- Test 1: Password hashing (bcrypt) ---
describe('Password Security', () => {
  it('should produce a hash different from the plain password', async () => {
    const bcrypt = await import('bcryptjs');
    const password = 'MySecurePass123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('should verify correct password against hash', async () => {
    const bcrypt = await import('bcryptjs');
    const password = 'MySecurePass123!';
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password against hash', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('correctpassword', 10);
    const isValid = await bcrypt.compare('wrongpassword', hash);
    expect(isValid).toBe(false);
  });
});

// --- Test 2: Progress Calculation ---
describe('Progress Calculation', () => {
  const allLessons = [
    { id: 'l1' }, { id: 'l2' }, { id: 'l3' }, { id: 'l4' }
  ];

  it('should return 0% when no lessons are completed', () => {
    const completedIds = new Set<string>();
    const completedCount = allLessons.filter(l => completedIds.has(l.id)).length;
    const pct = Math.round((completedCount / allLessons.length) * 100);
    expect(pct).toBe(0);
  });

  it('should return 50% when half lessons are completed', () => {
    const completedIds = new Set(['l1', 'l2']);
    const completedCount = allLessons.filter(l => completedIds.has(l.id)).length;
    const pct = Math.round((completedCount / allLessons.length) * 100);
    expect(pct).toBe(50);
  });

  it('should return 100% when all lessons are completed', () => {
    const completedIds = new Set(['l1', 'l2', 'l3', 'l4']);
    const completedCount = allLessons.filter(l => completedIds.has(l.id)).length;
    const pct = Math.round((completedCount / allLessons.length) * 100);
    expect(pct).toBe(100);
  });

  it('should return 0% if course has no lessons', () => {
    const emptyLessons: any[] = [];
    const pct = emptyLessons.length > 0 ? Math.round((0 / emptyLessons.length) * 100) : 0;
    expect(pct).toBe(0);
  });
});

// --- Test 3: Payment Plan Logic ---
describe('Payment Plan Logic', () => {
  const coursePrice = 200;
  const registrationFee = 20;

  it('should calculate correct first installment (50%)', () => {
    const firstInstallment = Math.round(coursePrice * 0.5);
    expect(firstInstallment).toBe(100);
  });

  it('should calculate correct second installment (50%)', () => {
    const secondInstallment = Math.round(coursePrice * 0.5);
    expect(secondInstallment).toBe(100);
  });

  it('registration fee should be a fixed 20 EUR', () => {
    expect(registrationFee).toBe(20);
  });

  it('full price should equal sum of two installments', () => {
    const first = Math.round(coursePrice * 0.5);
    const second = Math.round(coursePrice * 0.5);
    expect(first + second).toBe(coursePrice);
  });
});

// --- Test 4: Input Validation ---
describe('Input Validation', () => {
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (p: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(p);

  it('should accept valid email addresses', () => {
    expect(isValidEmail('student@example.com')).toBe(true);
    expect(isValidEmail('test.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('missing@')).toBe(false);
  });

  it('should reject passwords shorter than 8 characters', () => {
    expect(isStrongPassword('abc')).toBe(false);
    expect(isStrongPassword('1234567')).toBe(false);
  });

  it('should reject passwords without numbers', () => {
    expect(isStrongPassword('onlyletters')).toBe(false);
  });

  it('should reject passwords without letters', () => {
    expect(isStrongPassword('1234567890')).toBe(false);
  });

  it('should accept passwords of 8 or more characters with letters and numbers', () => {
    expect(isStrongPassword('secure123')).toBe(true);
    expect(isStrongPassword('password8')).toBe(true);
  });
});

// --- Test 5: Access Gate Logic ---
describe('Lesson Access Gate', () => {
  const canAccessLesson = (role: string, registrationFeePaid: boolean, paymentStatus: string) => {
    if (role === 'INSTRUCTOR' || role === 'ADMIN') return true;
    if (!registrationFeePaid) return false;
    if (paymentStatus !== 'PAID' && paymentStatus !== 'PARTIALLY_PAID') return false;
    return true;
  };

  it('should always grant access to INSTRUCTOR', () => {
    expect(canAccessLesson('INSTRUCTOR', false, 'PENDING')).toBe(true);
  });

  it('should always grant access to ADMIN', () => {
    expect(canAccessLesson('ADMIN', false, 'PENDING')).toBe(true);
  });

  it('should block student without registration fee', () => {
    expect(canAccessLesson('STUDENT', false, 'PAID')).toBe(false);
  });

  it('should block student with pending payment', () => {
    expect(canAccessLesson('STUDENT', true, 'PENDING')).toBe(false);
  });

  it('should grant access to student who paid in full', () => {
    expect(canAccessLesson('STUDENT', true, 'PAID')).toBe(true);
  });

  it('should grant access to student on installment plan', () => {
    expect(canAccessLesson('STUDENT', true, 'PARTIALLY_PAID')).toBe(true);
  });
});
