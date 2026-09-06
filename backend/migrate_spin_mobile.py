import sqlite3

conn = sqlite3.connect('instance/mobile_hub.db')
c = conn.cursor()

try:
    c.execute('ALTER TABLE spins ADD COLUMN mobile_number VARCHAR(15)')
    print('Added column mobile_number')
except Exception as e:
    print('Column status:', e)

c.execute('UPDATE spins SET mobile_number = (SELECT mobile FROM customers WHERE customers.id = spins.customer_id) WHERE mobile_number IS NULL')

try:
    c.execute('CREATE UNIQUE INDEX IF NOT EXISTS uq_spins_mobile_campaign ON spins(mobile_number, campaign_id)')
    print('Created unique index on (mobile_number, campaign_id)')
except Exception as e:
    print('Index status:', e)

conn.commit()
rows = c.execute('SELECT id, customer_id, mobile_number, claim_code FROM spins').fetchall()
print('Spins in DB:')
for r in rows:
    print(r)
conn.close()
