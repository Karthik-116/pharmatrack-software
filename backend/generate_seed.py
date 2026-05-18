import random
import json

analgesics = [('Dolo', 'Paracetamol', 'Analgesic & Antipyretic', 'Micro Labs', 'Fever and pain relief', 'Take 1 tablet every 6 hours if fever exceeds 100F. Max 4 tablets/day.', 'May cause liver damage if overdosed. Avoid alcohol.'), 
              ('Crocin Advance', 'Paracetamol', 'Analgesic', 'GSK', 'Fast relief from headache and fever', 'Take 1 tablet SOS. Do not exceed 4000mg/day.', 'Nausea, allergic skin reactions.'), 
              ('Combiflam', 'Ibuprofen + Paracetamol', 'Analgesic', 'Sanofi', 'Relief from muscle pain and swelling', 'Take 1 tablet twice a day after meals.', 'Stomach upset, ulcer risk on long term use.'), 
              ('Ultracet', 'Tramadol + Paracetamol', 'Analgesic', 'Dr. Reddy', 'Moderate to severe pain relief', 'Take 1 tablet every 8 hours. Not for children.', 'Dizziness, drowsiness, risk of dependence.')]

antibiotics = [('Augmentin 625', 'Amoxicillin + Clavulanate', 'Antibacterial', 'GSK', 'Bacterial infections of ear, nose, throat', 'Take 1 tablet twice daily for 5-7 days. Complete the course.', 'Diarrhea, fungal infections, allergic reactions.'), 
               ('Azithral 500', 'Azithromycin', 'Antibiotic', 'Alembic', 'Respiratory tract infections', 'Take 1 tablet daily for 3 days 1 hour before meal.', 'Stomach ache, nausea, QT prolongation.'), 
               ('Monocef-O', 'Cefpodoxime', 'Antibiotic', 'Aristo', 'Typhoid and UTI', 'Take 1 tablet twice daily after meals.', 'Mild diarrhea, rash.'), 
               ('Acivir', 'Acyclovir', 'Antiviral', 'Cipla', 'Herpes zoster and chickenpox', 'Take 1 tablet 5 times a day for 7 days.', 'Headache, nausea, kidney strain if dehydrated.')]

cardiac = [('Telmikind-H', 'Telmisartan + Hydrochlorothiazide', 'Antihypertensive', 'Mankind', 'High blood pressure management', 'Take 1 tablet daily in the morning.', 'Dizziness, dehydration, low potassium levels.'), 
           ('Glycomet-GP 2', 'Glimepiride + Metformin', 'Antidiabetic', 'USV', 'Type 2 Diabetes Mellitus', 'Take 1 tablet daily before breakfast.', 'Hypoglycemia, gastrointestinal upset.'), 
           ('Concor 5', 'Bisoprolol', 'Beta Blocker', 'Merck', 'Heart failure and Angina', 'Take 1 tablet daily at the same time.', 'Slow heart rate, fatigue, cold extremities.'), 
           ('Atorva 20', 'Atorvastatin', 'Lipid Lowering', 'Zydus', 'High cholesterol prevention', 'Take 1 tablet daily at bedtime.', 'Muscle pain, liver enzyme elevation.')]

gastro = [('Pan-D', 'Pantoprazole + Domperidone', 'Antacid & Antiemetic', 'Alkem', 'GERD and acidity with nausea', 'Take 1 capsule empty stomach in morning.', 'Dry mouth, headache, flatulence.'), 
          ('Omee', 'Omeprazole', 'Antacid', 'Alkem', 'Gastric ulcers and acidity', 'Take 1 capsule 30 mins before breakfast.', 'Bone thinning on prolonged use.'), 
          ('Gelusil', 'Magnesium Hydroxide + Aluminium Hydroxide', 'Antacid', 'Pfizer', 'Instant relief from heartburn', 'Chew 1-2 tablets after meals or SOS.', 'Constipation or mild diarrhea.'), 
          ('Rifagut', 'Rifaximin', 'Antibiotic (Gut)', 'Sun Pharma', 'IBS and infectious diarrhea', 'Take 1 tablet twice daily for 14 days.', 'Bloating, nausea.')]

respiratory = [('Allegra 120', 'Fexofenadine', 'Antihistamine', 'Sanofi', 'Allergic rhinitis and hives', 'Take 1 tablet daily.', 'Mild drowsiness, dry mouth.'), 
               ('Montair-LC', 'Montelukast + Levocetirizine', 'Antihistamine', 'Cipla', 'Asthma maintenance and severe allergies', 'Take 1 tablet daily at night.', 'Sleep disturbances, mood changes.'), 
               ('Asthalin', 'Salbutamol', 'Bronchodilator', 'Cipla', 'Asthma and COPD acute symptoms', 'Take 1 tablet SOS or thrice daily.', 'Tremors, palpitations, increased heart rate.'), 
               ('Cheston Cold', 'Cetirizine + Paracetamol + Phenylephrine', 'Cold Medicine', 'Cipla', 'Common cold, allergy and fever', 'Take 1 tablet twice daily.', 'Drowsiness, dry mouth, increased heart rate.')]

categories = [
    (analgesics, 'Analgesics & Antipyretics'),
    (antibiotics, 'Antibiotics & Antivirals'),
    (cardiac, 'Cardiac & Antidiabetics'),
    (gastro, 'Gastrointestinal & Antacids'),
    (respiratory, 'Antihistamines & Respiratory')
]

records = []
for cat_list, cat_name in categories:
    for i in range(40):
        base_med = cat_list[i % len(cat_list)]
        brand = f"{base_med[0]} {random.randint(1, 99)*10}" if i >= len(cat_list) else base_med[0]
        prod_id = f"{brand.replace(' ', '-').upper()}-{i}"
        
        records.append({
            'product_id': prod_id,
            'brand_name': brand,
            'generic_name': base_med[1],
            'composition': f"{base_med[1]} {random.randint(10, 500)}mg",
            'primary_use': base_med[4],
            'dosage_instructions': base_med[5],
            'storage_conditions': 'Store below 30°C in a dry place. Protect from direct sunlight.',
            'warning_side_effects': base_med[6],
            'manufacturer_name': base_med[3]
        })

with open('seed_medicines.py', 'w', encoding='utf-8') as f:
    f.write('import sys\nimport os\nfrom sqlalchemy.orm import Session\nfrom database import engine, SessionLocal\nfrom models import MasterMedicine, Base\n\n')
    f.write('def seed_db():\n')
    f.write('    db = SessionLocal()\n')
    f.write('    try:\n')
    f.write('        Base.metadata.create_all(bind=engine)\n')
    f.write('        medicines = ' + json.dumps(records, indent=4) + '\n')
    f.write('        for m in medicines:\n')
    f.write('            db_item = db.query(MasterMedicine).filter_by(product_id=m["product_id"]).first()\n')
    f.write('            if not db_item:\n')
    f.write('                db.add(MasterMedicine(**m))\n')
    f.write('        db.commit()\n')
    f.write('        print("Successfully seeded 200 medicines!")\n')
    f.write('    finally:\n')
    f.write('        db.close()\n\n')
    f.write('if __name__ == "__main__":\n')
    f.write('    seed_db()\n')
