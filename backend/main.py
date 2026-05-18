from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
import qrcode
import os
import json
import requests
import numpy as np
from dotenv import load_dotenv
import google.generativeai as genai

import models
import schemas
from database import engine, get_db
import bcrypt
from jose import jwt, JWTError

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-fallback")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


# Load environment variables
load_dotenv()

# Initialize Gemini API Embeddings globally to replace local SentenceTransformers
llm_api_key = os.getenv("LLM_API_KEY")
if llm_api_key:
    genai.configure(api_key=llm_api_key)

def get_embedding(text: str):
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return response['embedding']
    except Exception as e:
        print(f"Gemini API embedding failed: {e}")
        return [0.0] * 384  # Fallback zero vector matching expected dimension

from models import User
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PharmaTrack API")

@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QR_DIR = "qrcodes"
os.makedirs(QR_DIR, exist_ok=True)

def generate_qr_image(uuid_str: str, filepath: str):
    img = qrcode.make(uuid_str)
    img.save(filepath)

@app.get("/")
def read_root():
    return {"message": "PharmaTrack backend is fully operational! Visit /docs for the interactive API documentation."}

@app.post("/api/auth/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    token_data = {"sub": db_user.email}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return schemas.Token(access_token=token, token_type="bearer", email=db_user.email)

@app.get("/api/auth/stats")
def auth_stats(db: Session = Depends(get_db)):
    return {"total_users": db.query(models.User).count()}


@app.post("/api/generate_batch", response_model=schemas.GenerateBatchResponse)
def generate_batch(request: schemas.GenerateBatchRequest, db: Session = Depends(get_db)):
    selected_medicine = db.query(models.MasterMedicine).filter(
        models.MasterMedicine.product_id == request.product_id
    ).first()
    if not selected_medicine:
        raise HTTPException(status_code=404, detail=f"Medicine with product_id '{request.product_id}' not found.")
    
    box = models.Item(
        item_type=models.ItemType.BOX.value, 
        status=models.ItemStatus.CREATED.value,
        product_id=selected_medicine.product_id
    )
    db.add(box)
    db.commit()
    db.refresh(box)
    
    # Create batch directory
    batch_dir = os.path.join(QR_DIR, f"batch_{box.item_uuid[-6:]}")
    os.makedirs(batch_dir, exist_ok=True)
    
    generate_qr_image(box.item_uuid, os.path.join(batch_dir, f"box_{box.item_uuid[-6:]}.png"))

    strip_uuids = []
    for _ in range(request.strip_count):
        strip = models.Item(
            item_type=models.ItemType.STRIP.value, 
            parent_uuid=box.item_uuid, 
            status=models.ItemStatus.CREATED.value,
            product_id=selected_medicine.product_id
        )
        db.add(strip)
        db.commit()
        db.refresh(strip)
        strip_uuids.append(strip.item_uuid)
        generate_qr_image(strip.item_uuid, os.path.join(batch_dir, f"strip_{strip.item_uuid[-6:]}.png"))

    return schemas.GenerateBatchResponse(box_uuid=box.item_uuid, strip_uuids=strip_uuids)

@app.post("/api/scan/transit")
def scan_transit(request: schemas.ScanTransitRequest, db: Session = Depends(get_db)):
    box = db.query(models.Item).filter(models.Item.item_uuid == request.item_uuid, models.Item.item_type == models.ItemType.BOX.value).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")
        
    try:
        box.status = models.ItemStatus.TRANSIT.value
        box.current_location = request.location
        
        log = models.TrackingLog(item_uuid=box.item_uuid, scanned_by=request.scanned_by, location=request.location)
        db.add(log)
        
        children = db.query(models.Item).filter(models.Item.parent_uuid == box.item_uuid).all()
        for child in children:
            child.status = models.ItemStatus.TRANSIT.value
            child.current_location = request.location
            child_log = models.TrackingLog(item_uuid=child.item_uuid, scanned_by=request.scanned_by, location=request.location)
            db.add(child_log)
            
        db.commit()
        return {"message": "Transit scan successful, cascade update applied."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scan/verify")
def scan_verify(request: schemas.VerifyRequest, db: Session = Depends(get_db)):
    item = db.query(models.Item).options(joinedload(models.Item.medicine)).filter(models.Item.item_uuid == request.item_uuid, models.Item.item_type == models.ItemType.STRIP.value).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Product not found. Counterfeit detected.")
        
    if item.scan_count > 0:
        raise HTTPException(status_code=403, detail="Alert: Product Already Consumed!")
        
    if item.status in [models.ItemStatus.CREATED.value, models.ItemStatus.PACKED.value]:
        raise HTTPException(status_code=403, detail="Alert: Impossible Jump! Product bypassed logistics.")
        
    try:
        item.scan_count += 1
        item.status = models.ItemStatus.CONSUMED.value
        item.current_location = request.location
        
        log = models.TrackingLog(item_uuid=item.item_uuid, scanned_by=request.scanned_by, location=request.location)
        db.add(log)
        db.commit()
        
        med = item.medicine
        
        # Return exact product_id for RAG matching
        rag_product_id = med.product_id if med else "PARA-PLX"

        return {
            "verified": True,
            "status_code": "SUCCESS",
            "product_id": rag_product_id,
            "security": {
                "scan_count": item.scan_count,
                "message": "Authentic Product. Digital seal broken."
            },
            "medicine_details": {
                "brand_name": med.brand_name if med else "Unknown",
                "generic_name": med.generic_name if med else "Unknown",
                "batch_number": "B-" + item.item_uuid[-6:].upper(),
                "expiry_date": "2027-12-31",
                "manufacturer": med.manufacturer_name if med else "Unknown"
            },
            "usage_instructions": {
                "primary_use": med.primary_use if med else "Unknown",
                "how_to_use": med.dosage_instructions if med else "Unknown",
                "storage": med.storage_conditions if med else "Unknown",
                "warnings": med.warning_side_effects if med else "Unknown"
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=schemas.ChatResponse)
def chat_endpoint(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    raw_pid = request.product_id.upper()
    
    rag_map = {
        "DOLO": "PARA-PLX",
        "CROCIN": "PARA-PLX",
        "COMBIFLAM": "IBUP-PLX",
        "ULTRACET": "TRAM-PLX",
        "AUGMENTIN": "AMCL-PLX",
        "AZITHRAL": "AZIT-PLX",
        "MONOCEF": "CEFP-PLX",
        "ACIVIR": "ACYC-PLX",
        "TELMIKIND": "TELM-PLX",
        "GLYCOMET": "METF-PLX",
        "CONCOR": "BISO-PLX",
        "ATORVA": "ATOR-PLX",
        "PAN": "PANT-PLX",
        "OMEE": "OMEP-PLX",
        "GELUSIL": "ANTA-PLX",
        "RIFAGUT": "RIFA-PLX",
        "ALLEGRA": "FEXO-PLX",
        "MONTAIR": "MONT-PLX",
        "ASTHALIN": "SALB-PLX",
        "CHESTON": "CHES-PLX"
    }

    pid = "PARA-PLX"
    for prefix, r_id in rag_map.items():
        if raw_pid.startswith(prefix):
            pid = r_id
            break

    med_metadata = {
        "PARA-PLX": {"brand": "Dolo / Crocin Advance", "generic": "Paracetamol"},
        "IBUP-PLX": {"brand": "Combiflam", "generic": "Ibuprofen + Paracetamol"},
        "TRAM-PLX": {"brand": "Ultracet", "generic": "Tramadol + Paracetamol"},
        "AMCL-PLX": {"brand": "Augmentin 625", "generic": "Amoxicillin + Clavulanate"},
        "AZIT-PLX": {"brand": "Azithral 500", "generic": "Azithromycin"},
        "CEFP-PLX": {"brand": "Monocef-O", "generic": "Cefpodoxime"},
        "ACYC-PLX": {"brand": "Acivir", "generic": "Acyclovir"},
        "TELM-PLX": {"brand": "Telmikind-H", "generic": "Telmisartan + Hydrochlorothiazide"},
        "METF-PLX": {"brand": "Glycomet-GP 2", "generic": "Glimepiride + Metformin"},
        "BISO-PLX": {"brand": "Concor 5", "generic": "Bisoprolol"},
        "ATOR-PLX": {"brand": "Atorva 20", "generic": "Atorvastatin"},
        "PANT-PLX": {"brand": "Pan-D", "generic": "Pantoprazole + Domperidone"},
        "OMEP-PLX": {"brand": "Omee", "generic": "Omeprazole"},
        "ANTA-PLX": {"brand": "Gelusil", "generic": "Magnesium Hydroxide + Aluminium Hydroxide"},
        "RIFA-PLX": {"brand": "Rifagut", "generic": "Rifaximin"},
        "FEXO-PLX": {"brand": "Allegra 120", "generic": "Fexofenadine"},
        "MONT-PLX": {"brand": "Montair-LC", "generic": "Montelukast + Levocetirizine"},
        "SALB-PLX": {"brand": "Asthalin", "generic": "Salbutamol"},
        "CHES-PLX": {"brand": "Cheston Cold", "generic": "Cetirizine + Paracetamol + Phenylephrine"}
    }
    current_med = med_metadata.get(pid, {"brand": "Verified Medicine", "generic": "Unknown Generic"})

    query_vector = get_embedding(request.query)

    top_chunks = []
    
    # Mode A: Try SQLAlchemy with pgvector against Supabase
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        if "Karthiknihal@4365@" in db_url:
            db_url = db_url.replace("Karthiknihal@4365@", "Karthiknihal%404365@")
        try:
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            supa_engine = create_engine(db_url, echo=False)
            SupaSession = sessionmaker(bind=supa_engine)
            supa_db = SupaSession()
            try:
                # Execute vector similarity search with strict WHERE product_id = :pid isolation
                sql = text("""
                    SELECT topic, content 
                    FROM rag_chunks 
                    WHERE product_id = :pid 
                    ORDER BY embedding <-> :qvec 
                    LIMIT 3
                """)
                rows = supa_db.execute(sql, {"pid": pid, "qvec": str(query_vector)}).fetchall()
                for row in rows:
                    top_chunks.append({"topic": row[0], "content": row[1]})
            finally:
                supa_db.close()
        except Exception as e:
            print(f"SQLAlchemy pgvector search failed ({e}), falling back to REST API...")

    # Mode B: Fallback to Supabase REST API if SQLAlchemy failed
    if not top_chunks:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if supabase_url and supabase_key:
            try:
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
                res = requests.get(f"{supabase_url}rag_chunks?product_id=eq.{pid}", headers=headers)
                if res.status_code == 200:
                    chunks = res.json()
                    if chunks:
                        # Calculate cosine similarity locally in Python
                        q_arr = np.array(query_vector)
                        q_norm = np.linalg.norm(q_arr)
                        scored_chunks = []
                        for c in chunks:
                            c_arr = np.array(c["embedding"])
                            c_norm = np.linalg.norm(c_arr)
                            if q_norm > 0 and c_norm > 0:
                                sim = np.dot(q_arr, c_arr) / (q_norm * c_norm)
                            else:
                                sim = 0
                            scored_chunks.append((sim, c))
                        
                        scored_chunks.sort(key=lambda x: x[0], reverse=True)
                        for sim, c in scored_chunks[:3]:
                            top_chunks.append({"topic": c["topic"], "content": c["content"]})
            except Exception as e:
                print(f"Supabase REST API search failed ({e}), falling back to local JSONL...")

    # Mode C: Fallback to local medicines_data.jsonl if Supabase is empty/unreachable
    if not top_chunks:
        print("Using local medicines_data.jsonl fallback for RAG retrieval...")
        jsonl_path = os.path.join(os.path.dirname(__file__), "medicines_data.jsonl")
        if os.path.exists(jsonl_path):
            try:
                local_chunks = []
                with open(jsonl_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        data = json.loads(line)
                        if data.get("product_id") == pid:
                            clin = data.get("clinical_profile", {})
                            faq = data.get("patient_faq", {})
                            topics_map = {
                                "Mechanism of Action": clin.get("mechanism_of_action", ""),
                                "Primary Indications": faq.get("primary_indications", ""),
                                "Standard Dosage": faq.get("standard_dosage", ""),
                                "Critical Warnings": faq.get("critical_warnings", ""),
                                "Missed Dose Protocol": faq.get("missed_dose_protocol", "")
                            }
                            for t, c in topics_map.items():
                                clean_c = c.strip()
                                if clean_c:
                                    c_vec = get_embedding(clean_c)
                                    local_chunks.append({"topic": t, "content": clean_c, "embedding": c_vec})
                            break
                
                if local_chunks:
                    q_arr = np.array(query_vector)
                    q_norm = np.linalg.norm(q_arr)
                    scored_chunks = []
                    for c in local_chunks:
                        c_arr = np.array(c["embedding"])
                        c_norm = np.linalg.norm(c_arr)
                        if q_norm > 0 and c_norm > 0:
                            sim = np.dot(q_arr, c_arr) / (q_norm * c_norm)
                        else:
                            sim = 0
                        scored_chunks.append((sim, c))
                    
                    scored_chunks.sort(key=lambda x: x[0], reverse=True)
                    for sim, c in scored_chunks[:3]:
                        top_chunks.append({"topic": c["topic"], "content": c["content"]})
            except Exception as e:
                print(f"Local JSONL fallback failed: {e}")

    if not top_chunks:
        return schemas.ChatResponse(answer="I apologize, but I do not have sufficient verified clinical data blocks for this medicine to answer your question confidently.")

    # Pass retrieved chunks to LLM
    # Pass retrieved chunks to LLM
    context_text = "\n\n".join([f"[{c['topic']}]: {c['content']}" for c in top_chunks])
    
    # --- OPTION 1: THE STRICT PHARMACIST PROMPT ---
    system_prompt = (
        f"You are a strict, expert pharmacist AI assistant. The patient has successfully scanned a verified strip of {current_med['brand']} (Generic: {current_med['generic']}).\n\n"
        "CRITICAL RULES YOU MUST FOLLOW:\n"
        f"1. IMPLICIT CONTEXT: If the patient asks a general question (e.g., 'What is the dosage?'), ALWAYS assume they are asking about {current_med['brand']}.\n"
        f"2. THE ACKNOWLEDGEMENT: ALWAYS begin your answer by explicitly naming the medicine. Start with: 'For the {current_med['brand']} tablet you scanned...'\n"
        "3. THE RAG BOUNDARY: You MUST construct your answer using ONLY the 'Context Blocks' provided below. Do not use your pre-trained internet knowledge.\n"
        "4. THE REJECTION PROTOCOL (IMPORTANT): If the patient asks about a completely different medicine (like Vitamin C), or if the Context Blocks do not contain the answer to their question, you MUST decline. Say exactly: 'I apologize, but my verified data for this scanned product does not contain information about that.'\n"
        "5. THE DISCLAIMER: You MUST end every single response with this exact sentence on a new line: '*Please cross-check this information with a certified healthcare professional.*'"
    )
    # ----------------------------------------------
    
    full_prompt = f"System Directive: {system_prompt}\n\nContext Blocks:\n{context_text}\n\nPatient Question: {request.query}\n\nPharmacist Answer:"

    llm_key = os.getenv("LLM_API_KEY")
    if llm_key:
        try:
            genai.configure(api_key=llm_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(full_prompt)
            return schemas.ChatResponse(answer=response.text.strip())
        except Exception as e:
            print(f"LLM generation failed ({e}), using local synthesis fallback...")
    
    # Fallback synthesis if LLM API fails or key is invalid/rate-limited
    fallback_answer = "AI Pharmacist Consultation (Local Synthesis Mode):\n\n"
    for c in top_chunks:
        fallback_answer += f"• {c['topic']}: {c['content']}\n\n"
    fallback_answer += "\nNote: Answer compiled directly from verified pharmaceutical knowledge blocks."
    
    return schemas.ChatResponse(answer=fallback_answer.strip())