import Dexie from 'dexie';

export const db = new Dexie('GymDatabase');

// Schema definition
// ++id is auto-incrementing primary key
db.version(4).stores({
  members: '++id, name, contact, status, owner_id',
  attendance: '++id, member_id, date, owner_id',
  payments: '++id, member_id, month_year, owner_id',
  gym_settings: '[owner_id+category], owner_id, category', 
  cardio_subscriptions: '++id, member_id, status, owner_id',
  training_plans: '++id, member_id, status, owner_id',
  classes: '++id, name, day, owner_id',
  invoices: '++id, member_id, invoice_number, owner_id',
  plans: '++id, name, fee, owner_id'
});

export default db;
