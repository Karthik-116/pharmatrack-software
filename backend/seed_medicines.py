import sys
import os
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import MasterMedicine, Base

def seed_db():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        
        # Single optimized count check to eliminate network latency on startup
        count = db.query(MasterMedicine).count()
        if count > 0:
            print(f"MasterMedicine table already contains {count} records. Skipping initialization.")
            return

        medicines = [
            {
                "product_id": "DOLO-0",
                "brand_name": "Dolo",
                "generic_name": "Paracetamol",
                "composition": "Paracetamol 250mg",
                "primary_use": "Fever and pain relief",
                "dosage_instructions": "Take 1 tablet every 6 hours if fever exceeds 100F. Max 4 tablets/day.",
                "storage_conditions": "Store below 30°C in a dry place. Protect from direct sunlight.",
                "warning_side_effects": "May cause liver damage if overdosed. Avoid alcohol.",
                "manufacturer_name": "Micro Labs"
            },
            {
                "product_id": "CROCIN-ADVANCE-1",
                "brand_name": "Crocin Advance",
                "generic_name": "Paracetamol",
                "composition": "Paracetamol 187mg",
                "primary_use": "Fast relief from headache and fever",
                "dosage_instructions": "Take 1 tablet SOS. Do not exceed 4000mg/day.",
                "storage_conditions": "Store below 30°C in a dry place. Protect from direct sunlight.",
                "warning_side_effects": "Nausea, allergic skin reactions.",
                "manufacturer_name": "GSK"
            },
            {
                "product_id": "COMBIFLAM-2",
                "brand_name": "Combiflam",
                "generic_name": "Ibuprofen + Paracetamol",
                "composition": "Ibuprofen + Paracetamol 398mg",
                "primary_use": "Relief from muscle pain and swelling",
                "dosage_instructions": "Take 1 tablet twice a day after meals.",
                "storage_conditions": "Store below 30°C in a dry place. Protect from direct sunlight.",
                "warning_side_effects": "Stomach upset, ulcer risk on long term use.",
                "manufacturer_name": "Sanofi"
            },
            {
                "product_id": "ULTRACET-3",
                "brand_name": "Ultracet",
                "generic_name": "Tramadol + Paracetamol",
                "composition": "Tramadol + Paracetamol 226mg",
                "primary_use": "Moderate to severe pain relief",
                "dosage_instructions": "Take 1 tablet every 8 hours. Not for children.",
                "storage_conditions": "Store below 30°C in a dry place. Protect from direct sunlight.",
                "warning_side_effects": "Dizziness, drowsiness, risk of dependence.",
                "manufacturer_name": "Dr. Reddy"
            },
            {
                "product_id": "AUGMENTIN-625-0",
                "brand_name": "Augmentin 625",
                "generic_name": "Amoxicillin + Clavulanate",
                "composition": "Amoxicillin 500mg + Clavulanic Acid 125mg",
                "primary_use": "Bacterial infections (respiratory, ear, skin)",
                "dosage_instructions": "Take 1 tablet twice daily after meals for 5-7 days.",
                "storage_conditions": "Store below 25°C in a dry place.",
                "warning_side_effects": "Diarrhea, nausea, allergic reactions in penicillin-sensitive patients.",
                "manufacturer_name": "GSK"
            },
            {
                "product_id": "AZITHRAL-500-1",
                "brand_name": "Azithral 500",
                "generic_name": "Azithromycin",
                "composition": "Azithromycin 500mg",
                "primary_use": "Respiratory tract and ear infections",
                "dosage_instructions": "Take 1 tablet once daily for 3 to 5 days.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Stomach upset, diarrhea, minor nausea.",
                "manufacturer_name": "Alembic"
            },
            {
                "product_id": "MONOCEF-O-2",
                "brand_name": "Monocef-O",
                "generic_name": "Cefpodoxime",
                "composition": "Cefpodoxime Proxetil 200mg",
                "primary_use": "Sinusitis, throat and skin infections",
                "dosage_instructions": "Take 1 tablet twice daily after meals.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Mild diarrhea, rash, headache.",
                "manufacturer_name": "Aristo"
            },
            {
                "product_id": "ACIVIR-3",
                "brand_name": "Acivir",
                "generic_name": "Acyclovir",
                "composition": "Acyclovir 400mg",
                "primary_use": "Herpes simplex and shingles treatment",
                "dosage_instructions": "Take 1 tablet 3 to 5 times daily as prescribed.",
                "storage_conditions": "Store below 25°C in a dry place.",
                "warning_side_effects": "Nausea, mild headache, dizziness.",
                "manufacturer_name": "Cipla"
            },
            {
                "product_id": "TELMIKIND-H-0",
                "brand_name": "Telmikind-H",
                "generic_name": "Telmisartan + Hydrochlorothiazide",
                "composition": "Telmisartan 40mg + Hydrochlorothiazide 12.5mg",
                "primary_use": "Hypertension (High blood pressure)",
                "dosage_instructions": "Take 1 tablet once daily in the morning.",
                "storage_conditions": "Store below 30°C. Protect from moisture.",
                "warning_side_effects": "Dizziness, electrolyte imbalance, fatigue.",
                "manufacturer_name": "Mankind"
            },
            {
                "product_id": "GLYCOMET-GP-2-1",
                "brand_name": "Glycomet-GP 2",
                "generic_name": "Glimepiride + Metformin",
                "composition": "Glimepiride 2mg + Metformin 500mg",
                "primary_use": "Type 2 Diabetes Mellitus management",
                "dosage_instructions": "Take 1 tablet daily before breakfast.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Hypoglycemia (low blood sugar), stomach upset, nausea.",
                "manufacturer_name": "USV"
            },
            {
                "product_id": "CONCOR-5-2",
                "brand_name": "Concor 5",
                "generic_name": "Bisoprolol",
                "composition": "Bisoprolol Fumarate 5mg",
                "primary_use": "Hypertension and angina prevention",
                "dosage_instructions": "Take 1 tablet once daily in the morning.",
                "storage_conditions": "Store below 30°C. Protect from light.",
                "warning_side_effects": "Slow heart rate, fatigue, dizziness.",
                "manufacturer_name": "Merck"
            },
            {
                "product_id": "ATORVA-20-3",
                "brand_name": "Atorva 20",
                "generic_name": "Atorvastatin",
                "composition": "Atorvastatin 20mg",
                "primary_use": "High cholesterol and triglyceride reduction",
                "dosage_instructions": "Take 1 tablet once daily at bedtime.",
                "storage_conditions": "Store below 30°C. Protect from moisture.",
                "warning_side_effects": "Muscle pain, mild liver enzyme elevation.",
                "manufacturer_name": "Zydus"
            },
            {
                "product_id": "PAN-D-0",
                "brand_name": "Pan-D",
                "generic_name": "Pantoprazole + Domperidone",
                "composition": "Pantoprazole 40mg + Domperidone 30mg",
                "primary_use": "GERD, acid reflux, and peptic ulcers",
                "dosage_instructions": "Take 1 capsule once daily 30 minutes before breakfast.",
                "storage_conditions": "Store below 25°C in a dry place.",
                "warning_side_effects": "Headache, dry mouth, mild stomach ache.",
                "manufacturer_name": "Alkem"
            },
            {
                "product_id": "OMEE-1",
                "brand_name": "Omee",
                "generic_name": "Omeprazole",
                "composition": "Omeprazole 20mg",
                "primary_use": "Acidity, heartburn, and gastric ulcers",
                "dosage_instructions": "Take 1 capsule once daily before breakfast.",
                "storage_conditions": "Store below 25°C. Protect from light.",
                "warning_side_effects": "Nausea, mild headache, flatulence.",
                "manufacturer_name": "Alkem"
            },
            {
                "product_id": "GELUSIL-2",
                "brand_name": "Gelusil",
                "generic_name": "Magnesium Hydroxide + Aluminium Hydroxide",
                "composition": "Magnesium Hydroxide 250mg + Aluminium Hydroxide 250mg + Dimethicone 50mg",
                "primary_use": "Instant relief from acidity and gas",
                "dosage_instructions": "Chew 1-2 tablets as required after meals.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Chalky taste, mild constipation or diarrhea.",
                "manufacturer_name": "Pfizer"
            },
            {
                "product_id": "RIFAGUT-3",
                "brand_name": "Rifagut",
                "generic_name": "Rifaximin",
                "composition": "Rifaximin 250mg",
                "primary_use": "Traveler's diarrhea and hepatic encephalopathy",
                "dosage_instructions": "Take 1 tablet twice daily as prescribed.",
                "storage_conditions": "Store below 30°C. Protect from moisture.",
                "warning_side_effects": "Nausea, mild abdominal cramping.",
                "manufacturer_name": "Sun Pharma"
            },
            {
                "product_id": "ALLEGRA-120-0",
                "brand_name": "Allegra 120",
                "generic_name": "Fexofenadine",
                "composition": "Fexofenadine Hydrochloride 120mg",
                "primary_use": "Allergic rhinitis, sneezing, and runny nose",
                "dosage_instructions": "Take 1 tablet once daily as required.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Mild drowsiness, headache, dry mouth.",
                "manufacturer_name": "Sanofi"
            },
            {
                "product_id": "MONTAIR-LC-1",
                "brand_name": "Montair-LC",
                "generic_name": "Montelukast + Levocetirizine",
                "composition": "Montelukast 10mg + Levocetirizine 5mg",
                "primary_use": "Allergic asthma and chronic rhinitis",
                "dosage_instructions": "Take 1 tablet once daily at bedtime.",
                "storage_conditions": "Store below 30°C. Protect from light.",
                "warning_side_effects": "Drowsiness, fatigue, dry mouth.",
                "manufacturer_name": "Cipla"
            },
            {
                "product_id": "ASTHALIN-2",
                "brand_name": "Asthalin",
                "generic_name": "Salbutamol",
                "composition": "Salbutamol 4mg",
                "primary_use": "Asthma and bronchospasm relief",
                "dosage_instructions": "Take 1 tablet three times daily as prescribed.",
                "storage_conditions": "Store below 30°C. Protect from light.",
                "warning_side_effects": "Tremors, increased heart rate, mild headache.",
                "manufacturer_name": "Cipla"
            },
            {
                "product_id": "CHESTON-COLD-3",
                "brand_name": "Cheston Cold",
                "generic_name": "Cetirizine + Paracetamol + Phenylephrine",
                "composition": "Cetirizine 5mg + Paracetamol 325mg + Phenylephrine 10mg",
                "primary_use": "Common cold, fever, and nasal congestion",
                "dosage_instructions": "Take 1 tablet twice daily after meals.",
                "storage_conditions": "Store below 30°C in a dry place.",
                "warning_side_effects": "Drowsiness, dry mouth, mild dizziness.",
                "manufacturer_name": "Cipla"
            }
        ]

        # Perform an immediate bulk insert for just those active demo medicines
        db.bulk_insert_mappings(MasterMedicine, medicines)
        db.commit()
        print(f"Successfully bulk seeded {len(medicines)} active demo medicines!")
    except Exception as e:
        print(f"Database seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
