// Seeds a demo household. Run with: npm run db:seed
// Login: demo@homevault.app / demo1234
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_EMAIL = 'demo@homevault.app';

const now = new Date();
const days = (n: number, hour = 9) => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + n, hour);
  return d;
};
const monthsAgo = (m: number, day: number) => new Date(now.getFullYear(), now.getMonth() - m, Math.min(day, 28), 12);

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log('Demo data already exists; removing it and re-seeding…');
    await prisma.household.delete({ where: { id: existing.householdId } });
  }

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const household = await prisma.household.create({
    data: {
      name: 'The Rivera Family',
      plan: 'FAMILY',
      trialEndsAt: days(30),
      users: {
        create: [
          { name: 'Alex Rivera', email: DEMO_EMAIL, passwordHash, role: 'OWNER' },
          { name: 'Sam Rivera', email: 'sam@homevault.app', passwordHash, role: 'ADMIN' },
        ],
      },
    },
    include: { users: true },
  });
  const [alex, sam] = household.users;
  const householdId = household.id;

  await prisma.task.createMany({
    data: [
      { householdId, title: 'Renew car registration', dueDate: days(-3), priority: 'HIGH', category: 'Vehicle', assigneeId: alex.id },
      { householdId, title: 'Replace HVAC air filter', dueDate: days(-1), priority: 'MEDIUM', category: 'Home', recurrence: 'MONTHLY', assigneeId: sam.id },
      { householdId, title: "Schedule Mia's dental cleaning", dueDate: days(4), priority: 'MEDIUM', category: 'Health' },
      { householdId, title: 'Pay property tax (2nd installment)', dueDate: days(12), priority: 'HIGH', category: 'Finance', assigneeId: alex.id },
      { householdId, title: 'Test smoke detectors', dueDate: days(20), priority: 'LOW', category: 'Home', recurrence: 'YEARLY' },
      { householdId, title: 'Review life insurance beneficiaries', priority: 'MEDIUM', category: 'Finance' },
      { householdId, title: 'Book winter tire change', status: 'DONE', completedAt: days(-5), dueDate: days(-6), category: 'Vehicle' },
    ],
  });

  await prisma.event.createMany({
    data: [
      { householdId, title: 'Pediatrician check-up (Mia)', startsAt: days(2, 10), location: 'Bayview Pediatrics', category: 'Health' },
      { householdId, title: 'School parent-teacher meeting', startsAt: days(5, 17), location: 'Lincoln Elementary', category: 'School' },
      { householdId, title: 'Grandma visiting', startsAt: days(9), endsAt: days(12), allDay: true, category: 'Family' },
      { householdId, title: 'Plumber: fix kitchen sink', startsAt: days(1, 14), location: 'Home', category: 'Home' },
    ],
  });

  await prisma.contact.createMany({
    data: [
      { householdId, name: 'Maria Rivera', category: 'FAMILY', relationship: 'Grandmother', phone: '(555) 201-3344', isEmergency: true },
      { householdId, name: 'Jordan Lee', category: 'FAMILY', relationship: 'Neighbor & spare key holder', phone: '(555) 778-1020', isEmergency: true },
      { householdId, name: 'Dr. Priya Shah', category: 'MEDICAL', relationship: 'Pediatrician', phone: '(555) 430-9000', address: 'Bayview Pediatrics, 12 Harbor St' },
      { householdId, name: 'Mike Chen', category: 'SERVICE', relationship: 'Plumber', phone: '(555) 312-8899' },
      { householdId, name: 'Dana Brooks', category: 'INSURANCE', relationship: 'Home & auto insurance agent', phone: '(555) 650-4411', email: 'dana@safeharbor.example' },
      { householdId, name: 'Hollis & Grant LLP', category: 'LEGAL', relationship: 'Estate attorney', phone: '(555) 900-1200' },
    ],
  });

  await prisma.document.createMany({
    data: [
      { householdId, title: 'Homeowners insurance policy', category: 'INSURANCE', notes: 'Safe Harbor Mutual · Policy HO-5521873 · $1,000 deductible', expiresAt: days(25), includeInBinder: true },
      { householdId, title: 'Auto insurance (both cars)', category: 'INSURANCE', notes: 'Safe Harbor Mutual · Policy AU-2209 · Roadside assistance included', expiresAt: days(140), includeInBinder: true },
      { householdId, title: 'Term life insurance – Alex', category: 'INSURANCE', notes: '20-year term, $750k, beneficiary: Sam', includeInBinder: true },
      { householdId, title: 'Last will & testament', category: 'LEGAL', notes: 'Original in fireproof safe (hall closet). Copy with Hollis & Grant LLP.', includeInBinder: true },
      { householdId, title: 'Passports (family)', category: 'IDENTITY', notes: 'All four passports in the safe', expiresAt: days(400) },
      { householdId, title: 'Mortgage statement', category: 'FINANCIAL', notes: 'First Lake Bank · Loan #77810' },
      { householdId, title: '2025 tax return', category: 'TAX' },
    ],
  });

  // Six months of receipts with a few recurring subscriptions and HSA-eligible items.
  const receiptSpecs: { m: number; d: number; merchant: string; category: string; items: [string, number, string, boolean?][]; method?: string }[] = [];
  for (let m = 0; m < 6; m++) {
    receiptSpecs.push(
      { m, d: 3, merchant: 'Whole Foods Market', category: 'GROCERIES', items: [['Organic milk', 6.49, 'GROCERIES'], ['Bananas', 2.19, 'GROCERIES'], ['Chicken breast', 14.8, 'GROCERIES'], ['Greek yogurt', 7.5, 'GROCERIES'], ['Sourdough bread', 5.99, 'GROCERIES']], method: 'VISA' },
      { m, d: 17, merchant: "Trader Joe's", category: 'GROCERIES', items: [['Frozen dumplings', 4.99, 'GROCERIES'], ['Coffee beans', 9.99, 'GROCERIES'], ['Avocados', 5.49, 'GROCERIES'], ['Pasta & sauce', 6.78, 'GROCERIES']] },
      { m, d: 8, merchant: 'Netflix', category: 'SUBSCRIPTIONS', items: [['Standard plan', 15.49, 'SUBSCRIPTIONS']] },
      { m, d: 12, merchant: 'Spotify', category: 'SUBSCRIPTIONS', items: [['Family plan', 16.99, 'SUBSCRIPTIONS']] },
      { m, d: 21, merchant: 'Shell', category: 'TRANSPORT', items: [['Unleaded fuel', 48 + m * 3.1, 'TRANSPORT']] },
    );
  }
  receiptSpecs.push(
    { m: 0, d: Math.max(1, now.getDate() - 2), merchant: 'CVS Pharmacy', category: 'HEALTH', items: [['Children\'s ibuprofen', 9.49, 'HEALTH', true], ['Bandages', 4.99, 'HEALTH', true], ['Sunscreen SPF 50', 12.99, 'HEALTH', true], ['Shampoo', 6.49, 'HOUSEHOLD']] },
    { m: 0, d: Math.max(1, now.getDate() - 1), merchant: 'Chipotle', category: 'DINING', items: [['Burrito bowls x3', 38.4, 'DINING']] },
    { m: 0, d: 6, merchant: 'Olive Garden', category: 'DINING', items: [['Family dinner', 92.3, 'DINING']] },
    { m: 1, d: 14, merchant: 'Pizza Palace', category: 'DINING', items: [['Large pizzas x2', 41.0, 'DINING']] },
    { m: 2, d: 9, merchant: 'Target', category: 'HOUSEHOLD', items: [['Laundry detergent', 13.99, 'HOUSEHOLD'], ['Paper towels', 18.49, 'HOUSEHOLD'], ['Kids crayons', 4.29, 'KIDS']] },
    { m: 3, d: 19, merchant: 'Walgreens', category: 'HEALTH', items: [['Prescription copay', 15.0, 'HEALTH', true], ['Thermometer', 19.99, 'HEALTH', true]] },
  );
  for (const r of receiptSpecs) {
    // Vary grocery baskets a little month to month so charts look realistic.
    const jitter = r.category === 'GROCERIES' ? 1 + (((r.m * 7 + r.d) % 5) - 2) * 0.06 : 1;
    const items = r.items.map(([name, price, category, hsa]) => ({ name, price: Math.round(price * jitter * 100) / 100, category, hsaEligible: Boolean(hsa) }));
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    const date = monthsAgo(r.m, r.d);
    if (date > now) continue;
    await prisma.receipt.create({
      data: {
        householdId,
        merchant: r.merchant,
        purchaseDate: date,
        total: Math.round(subtotal * 100) / 100,
        category: r.category,
        paymentMethod: r.method ?? 'VISA',
        source: 'UPLOAD',
        items: { create: items },
      },
    });
  }

  const tvReceipt = await prisma.receipt.create({
    data: {
      householdId,
      merchant: 'Best Buy',
      purchaseDate: monthsAgo(10, 15),
      total: 649.99,
      category: 'ELECTRONICS',
      source: 'UPLOAD',
      items: { create: [{ name: 'Samsung 55" 4K TV', price: 649.99, category: 'ELECTRONICS', warrantyMonths: 12 }] },
    },
  });

  await prisma.asset.createMany({
    data: [
      { householdId, name: 'Samsung 55" 4K TV', category: 'ELECTRONICS', brand: 'Samsung', model: 'UN55CU7000', serialNumber: 'SN-0X99812', purchaseDate: monthsAgo(10, 15), purchasePrice: 649.99, warrantyExpiresAt: days(45), location: 'Living room', receiptId: tvReceipt.id },
      { householdId, name: 'LG Refrigerator', category: 'APPLIANCE', brand: 'LG', model: 'LRMVS3006S', purchaseDate: monthsAgo(20, 2), purchasePrice: 2199, warrantyExpiresAt: days(10), location: 'Kitchen', notes: 'Extended warranty via Home Depot Protection Plan' },
      { householdId, name: 'MacBook Air', category: 'ELECTRONICS', brand: 'Apple', purchaseDate: monthsAgo(4, 1), purchasePrice: 1099, warrantyExpiresAt: days(240), location: 'Home office' },
      { householdId, name: 'Honda CR-V (2021)', category: 'VEHICLE', brand: 'Honda', serialNumber: 'VIN 7FARW2H59ME012345', purchasePrice: 31500, location: 'Garage' },
      { householdId, name: 'Engagement ring', category: 'JEWELRY', purchasePrice: 4200, notes: 'Appraisal in documents; insured under homeowners rider' },
    ],
  });

  await prisma.emergencyEntry.createMany({
    data: [
      { householdId, section: 'MEDICAL', title: 'Allergies & medications', content: 'Mia: peanut allergy (EpiPen in kitchen drawer + backpack).\nAlex: takes lisinopril 10mg daily.\nBlood types: Alex O+, Sam A+.' },
      { householdId, section: 'INSURANCE', title: 'Who to call after an accident or damage', content: 'Call Dana Brooks (agent) first, then the 24/7 claims line on the back of the insurance cards in the glovebox.' },
      { householdId, section: 'FINANCIAL', title: 'Accounts overview', content: 'Checking & savings: First Lake Bank (joint).\nRetirement: Alex 401k via employer, Sam Roth IRA at Vanguard.\nMortgage autopays on the 1st.' },
      { householdId, section: 'UTILITIES', title: 'Shut-offs', content: 'Water main: basement, north wall, red handle.\nGas: outside meter, left side of house (wrench hanging next to it).\nBreaker panel: garage.' },
      { householdId, section: 'DIGITAL_ACCESS', title: 'Password manager', content: 'All passwords live in our family password manager. Emergency access kit is printed and stored in the safe.' },
      { householdId, section: 'LEGACY', title: 'Letter to the kids', content: 'A sealed letter for Mia and Leo is with the will in the safe.' },
    ],
  });

  console.log(`Seeded demo household "${household.name}". Login: ${DEMO_EMAIL} / demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
