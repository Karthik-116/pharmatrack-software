from database import engine, SessionLocal
import models
import os
import qrcode

models.Base.metadata.create_all(bind=engine)
QR_DIR = "qrcodes"
os.makedirs(QR_DIR, exist_ok=True)

def generate_qr_image(uuid_str: str, filename: str):
    img = qrcode.make(uuid_str)
    img.save(os.path.join(QR_DIR, filename))

def seed():
    db = SessionLocal()
    
    if db.query(models.Item).first():
        print("Database already seeded")
        return
        
    box = models.Item(item_type=models.ItemType.BOX.value, status=models.ItemStatus.PACKED.value, current_location="Factory_Hub")
    db.add(box)
    db.commit()
    db.refresh(box)
    generate_qr_image(box.item_uuid, f"seed_box_{box.item_uuid[-6:]}.png")
    
    for _ in range(5):
        strip = models.Item(item_type=models.ItemType.STRIP.value, parent_uuid=box.item_uuid, status=models.ItemStatus.PACKED.value, current_location="Factory_Hub")
        db.add(strip)
        db.commit()
        db.refresh(strip)
        generate_qr_image(strip.item_uuid, f"seed_strip_{strip.item_uuid[-6:]}.png")
        
    print(f"Seeded 1 Box and 5 Strips.")

if __name__ == "__main__":
    seed()
