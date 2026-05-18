import requests
import json
import time

# A sample of your 100+ list (add the rest of your list here)
medicines = [
    "Acetaminophen", "Ibuprofen", "Amoxicillin", "Azithromycin", "Pantoprazole"
]

OUTPUT_FILE = "medicines_data.jsonl"

def fetch_fda_data(generic_name):
    print(f"Fetching data for: {generic_name}...")
    
    # OpenFDA API endpoint searching by generic name
    url = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:\"{generic_name}\"&limit=1"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [{}])[0]
            
            # Navigate the deeply nested FDA JSON
            openfda_meta = results.get('openfda', {})
            
            return {
                "product_id": f"{generic_name[:4].upper()}-API", # e.g., PARA-API
                "brand_variants": openfda_meta.get("brand_name", ["Generic"]),
                "clinical_profile": {
                    "generic_name": generic_name,
                    "therapeutic_class": openfda_meta.get("pharm_class_epc", ["Unknown Class"])[0],
                    "mechanism_of_action": results.get("clinical_pharmacology", ["Mechanism data not provided in API."])[0][:300] + "..."
                },
                "patient_faq": {
                    "primary_indications": results.get("indications_and_usage", ["Indications not listed."])[0][:300] + "...",
                    "standard_dosage": results.get("dosage_and_administration", ["Dosage instructions not found."])[0][:300] + "...",
                    "critical_warnings": results.get("warnings", ["No specific warnings pulled."])[0][:300] + "...",
                    "missed_dose_protocol": "Consult your physician or pharmacist regarding missed doses for this specific medication."
                }
            }
        else:
            print(f"  [-] Failed to find {generic_name} in FDA database.")
            return None
            
    except Exception as e:
        print(f"  [!] Error connecting for {generic_name}: {e}")
        return None

# Execute the extraction
with open(OUTPUT_FILE, 'w') as f:
    for med in medicines:
        data = fetch_fda_data(med)
        if data:
            # Write exactly one JSON object per line (JSONL format)
            f.write(json.dumps(data) + '\n')
            print(f"  [+] Success: Appended {med} to {OUTPUT_FILE}")
        
        # Polite API delay to prevent getting IP blocked by the US Govt
        time.sleep(1)

print("\nExtraction Complete! Check your medicines_data.jsonl file.")