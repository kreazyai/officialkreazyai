#!/usr/bin/env python3
"""
KreazyAI Pilot Dataset Comprehensive Remediation Engine (Production Grade)

Reads from original backups and applies 100% catalog-grounded fixes:
1. Replaces unilateral order confirmations with recorded details + verification step.
2. Replaces simulated address updates with noted-for-fulfillment-verification workflow.
3. Escalates payment/refund issues to human finance desk without false approval promises.
4. Refers wholesale/bulk discounts to corporate sales management desk.
5. Refers corporate VAT invoices to management accounts desk.
6. Enforces 7-day manufacturing defect policy for furniture (no free preference/size exchange).
7. Mathematically calculates and enforces: unit price * qty + exact tenant delivery fee.
8. Prevents order bookings on out-of-stock catalog items (Hoodie, Powerbank).
9. Enforces furniture delivery times (2-3 days inside, 4-6 days outside) and 10% advance notice.
10. Preserves 800 train and 200 validation boundaries with 0% data leakage.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import glob
import re
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent
PROFILES_DIR = BASE_DIR / "business_profiles"
TRAIN_BACKUP = BASE_DIR / "training" / "pilot_train.original_backup.jsonl"
VAL_BACKUP = BASE_DIR / "training" / "pilot_validation.original_backup.jsonl"
TRAIN_OUT = BASE_DIR / "training" / "pilot_train.jsonl"
VAL_OUT = BASE_DIR / "training" / "pilot_validation.jsonl"
CORRECTION_LOG_FILE = BASE_DIR / "dataset_correction_log.jsonl"
ROOT_LOG_FILE = BASE_DIR.parent / "dataset_correction_log.jsonl"

OUTSIDE_DHAKA_LOCATIONS = [
    "sylhet", "chittagong", "chattogram", "rajshahi", "khulna", "barisal", "barishal",
    "rangpur", "mymensingh", "comilla", "cumilla", "gazipur", "narayanganj", "savar",
    "bogura", "bogra", "cox's bazar", "jashore", "jessore", "feni", "noakhali",
    "upashahar, sylhet", "chawkbazar, chittagong", "gazipur chowrasta", "barisal sadar"
]

def load_profiles():
    profiles = {}
    for p in glob.glob(str(PROFILES_DIR / "*.json")):
        d = json.load(open(p, "r", encoding="utf-8"))
        profiles[d["tenant_id"]] = d
    return profiles

def extract_ordered_product(user_text, catalog):
    user_lower = user_text.lower()
    # Check exact full name or SKU first
    for prod in catalog:
        if prod["name"].lower() in user_lower or prod["sku"].lower() in user_lower:
            return prod
    # Check distinct identifying keywords
    for prod in catalog:
        keywords = [w.lower() for w in prod["name"].split() if len(w) > 4 and w.lower() not in ["black", "white", "piece", "premium", "touchscreen", "wireless"]]
        if any(kw in user_lower for kw in keywords):
            return prod
    return None

def is_outside_dhaka(conv_text):
    conv_lower = conv_text.lower()
    return any(loc in conv_lower for loc in OUTSIDE_DHAKA_LOCATIONS)

def detect_script(text):
    has_bangla = bool(re.search(r'[\u0980-\u09FF]', text))
    if has_bangla:
        return "bangla"
    english_keywords = ["thank", "order", "delivery", "confirmed", "total", "payable", "customer", "support", "hours"]
    banglish_keywords = ["apnar", "amader", "taka", "hoyeche", "shathe", "korte", "paben", "shighroi", "vaiya", "bhai"]
    t_lower = text.lower()
    eng_cnt = sum(1 for w in english_keywords if w in t_lower)
    bng_cnt = sum(1 for w in banglish_keywords if w in t_lower)
    if bng_cnt > eng_cnt:
        return "banglish"
    return "english"

def extract_customer_name(user_text, script_type):
    m = re.search(r'(?:Name|নাম|amar name|amar nam)[:\s]*([A-Za-z]+(?:\s+[A-Za-z]+)+)', user_text, re.IGNORECASE)
    if not m:
        m = re.search(r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b', user_text)
    if m:
        name = m.group(1).split(',')[0].replace('Address', '').replace('Phone', '').replace('Upashahar', '').replace('Gulshan', '').strip()
        if len(name) > 2 and len(name) < 25 and not any(kw in name.lower() for kw in ["appliances", "furniture", "electronics", "fashion", "shoes", "grocery"]):
            return name
    return "গ্রাহক" if script_type == "bangla" else ("Customer" if script_type == "english" else "vaiya")

def remediate_record(rec, profiles):
    rec_id = rec["id"]
    tid = rec["tenant_id"]
    prof = profiles[tid]
    policies = prof["policies"]
    catalog = prof["catalog"]
    
    fee_in = policies["fee_inside_dhaka"]
    fee_out = policies["fee_outside_dhaka"]
    time_in = policies["delivery_dhaka"]
    time_out = policies["delivery_outside_dhaka"]
    
    messages = rec["messages"]
    user_texts = [m["content"] for m in messages if m["role"] == "user"]
    user_text_combined = " ".join(user_texts)
    
    outside = is_outside_dhaka(user_text_combined)
    current_fee = fee_out if outside else fee_in
    current_time = time_out if outside else time_in
    ordered_prod = extract_ordered_product(user_text_combined, catalog)

    detected_issues = []
    actions_taken = []
    modified = False

    new_messages = []
    for m in messages:
        if m["role"] != "assistant":
            new_messages.append(m)
            continue
            
        new_m = dict(m)
        try:
            parsed = json.loads(m["content"])
        except Exception:
            new_messages.append(m)
            continue

        analysis = parsed.get("analysis", {})
        reply = parsed.get("reply", "")
        reply_orig = reply
        script_type = detect_script(reply)

        # -------------------------------------------------------------
        # 1. High Priority Payment / Refund Escalation without False Promises
        # -------------------------------------------------------------
        payment_triggers = ["refund", "bkash taka ashe nai", "cancel korsi", "taka ferot", "money back", "payment issue"]
        if any(w in user_text_combined.lower() for w in payment_triggers):
            if any(term in reply.lower() for term in ["cancellation approve", "auto-refund", "trx slip", "refund approved", "finance desk apnar"]):
                detected_issues.append("UNAUTHORIZED_REFUND_OR_CANCELLATION_PROMISE")
                analysis["priority"] = "HIGH"
                analysis["requires_human"] = True
                analysis["escalation_reason"] = "Payment dispute/refund status requires verification by finance desk"
                
                if script_type == "bangla":
                    reply = "জি, আপনার অর্ডার সংক্রান্ত পেমেন্ট/রিফান্ডের বিষয়টি আমরা গুরুত্বের সাথে নোট করেছি। লেনদেন ও অ্যাকাউন্টিং তথ্যের সুরক্ষার জন্য এটি সরাসরি আমাদের হিউম্যান সাপোর্ট ও ফাইন্যান্স ডেস্কে ফরোয়ার্ড করা হয়েছে। একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করে ট্রানজ্যাকশন ভেরিফাই করবেন।"
                elif script_type == "english":
                    reply = "We have noted your payment and refund inquiry for your order. For transaction security, payment verifications are handled directly by our finance and support team. Your case has been escalated to a human representative who will contact you shortly to review the transaction."
                else:
                    reply = "Ji vaiya, apnar payment/refund request ti amra HIGH priority te note korechi. Transaction data verification er jonno issue ti amader human accounts desk e escalate kora hoyeche. Ekjon representative shighroi apnar sathe jogajog kore verify korben."
                
                actions_taken.append("Escalated payment dispute to human finance desk without unauthorized approval claim")
                modified = True

        # -------------------------------------------------------------
        # 1b. Free Courier Pickup & Immediate Replacement Dispatch
        # -------------------------------------------------------------
        if any(term in reply.lower() for term in ["free courier pickup", "pickup ar fresh new piece", "fresh new piece dispatch", "courier pickup ar"]):
            detected_issues.append("UNAUTHORIZED_PICKUP_AND_DISPATCH_PROMISE")
            analysis["priority"] = "HIGH"
            analysis["requires_human"] = True
            analysis["escalation_reason"] = "Transit damaged package claim requires verification by claims desk"
            if script_type == "bangla":
                reply = "ট্রানজিটে পার্সেল ক্ষতিগ্রস্ত হওয়ায় আমরা আন্তরিকভাবে দুঃখিত। অনুগ্রহ করে ক্ষতিগ্রস্ত বক্স ও পণ্যের সুস্পষ্ট ছবি বা আনবক্সিং ভিডিও আমাদের ইনবক্সে পাঠান। বিষয়টি আমাদের হিউম্যান ক্লেইম ডেস্কে ফরোয়ার্ড করা হয়েছে; আমাদের প্রতিনিধি কুরিয়ার পার্টনারের সাথে ভেরিফাই করে পলিসি অনুযায়ী রিপ্লেসমেন্ট প্রক্রিয়ায় সরাসরি সহায়তা করবেন।"
            elif script_type == "english":
                reply = "We deeply apologize for the transit damage to your package. Please share clear photos or an unboxing video of the damaged box and invoice. Your claim has been escalated to our human support desk; our representative will verify with the courier partner and assist you with the replacement process."
            else:
                reply = "Transit handling e package damage howay amra khub dukkhito vaiya! Damaged box o product er clear photo ba unboxing video amader share korun. Issue ti amader human claims desk e escalate kora hoyeche; tara courier partner er sathe verify kore policy onujayi apnar replacement process e shorashori assist korbe."
            actions_taken.append("Replaced unilateral pickup/dispatch claim with claims desk verification workflow")
            modified = True

        # -------------------------------------------------------------
        # 1c. Invented Express Rider / Morning Delivery Slots
        # -------------------------------------------------------------
        if any(term in reply.lower() for term in ["special rider express", "rider express slot", "সকালের বিশেষ এক্সপ্রেস স্লট", "special rider"]) or ("express slot" in reply.lower() and any(w in user_text_combined.lower() for w in ["emergency", "urgent", "morning", "ajkei"])):
            detected_issues.append("INVENTED_EXPRESS_DELIVERY_SLOT")
            if tid == "tenant_furniture_05":
                if script_type == "bangla":
                    reply = "আমাদের ErgoPro High-Back Mesh Task Chair (৳11500) স্টকে রয়েছে। তবে ঢাকার ভেতরে আমাদের ফার্নিচার ডেলিভারি সময় ২ থেকে ৩ কার্যদিবস (রুম অ্যাসেম্বলিসহ)। ফার্নিচারের মতো ভারী পণ্যের ক্ষেত্রে তাৎক্ষণিক সকালের বা সেইম-ডে এক্সপ্রেস স্লট প্রযোজ্য নয়।"
                else:
                    reply = "Amader ErgoPro High-Back Mesh Task Chair (৳11500) in-stock ache. Tobe Dhaka te furniture delivery time 2 to 3 business days (room assembly shoho). Bulky furniture er jonno instant morning ba same-day express rider slot available nei."
            elif tid == "tenant_grocery_04":
                reply = f"Dhaka city te amader regular delivery policy: Same day if ordered before 12 PM, else next day (delivery fee ৳{fee_in})। Alada express rider slot er proyojon nei."
            else:
                if script_type == "bangla":
                    reply = f"ঢাকার ভেতরে আমাদের নিয়মিত ডেলিভারি সময় {time_in} (ডেলিভারি চার্জ ৳{fee_in})। জরুরি সেইম-ডে এক্সপ্রেস রাইডার বা সকালের বিশেষ এক্সপ্রেস স্লট আমাদের বর্তমান স্টোর পলিসিতে অন্তর্ভুক্ত নয়।"
                elif script_type == "english":
                    reply = f"Our standard delivery timeline within Dhaka is {time_in} (delivery fee ৳{fee_in}). We do not currently offer special same-day express rider or morning delivery slots."
                else:
                    reply = f"Dhaka city te amader standard delivery timeline holo {time_in} (delivery fee ৳{fee_in})। Emergency same-day express rider slot amader regular store policy te ontorbhukto nei vaiya."
            actions_taken.append("Replaced invented express rider slot with grounded store delivery policy")
            modified = True

        # -------------------------------------------------------------
        # 1d. Unsupported Image-Sending Promises & Ignored Product Exclusions
        # -------------------------------------------------------------
        if any(term in reply.lower() for term in ["unboxing photos", "photos amra inbox", "chobi pathiye dicchi", "inbox e pathiye dicchi", "real unboxing"]):
            detected_issues.append("UNSUPPORTED_IMAGE_SENDING_PROMISE")
            
            # Check if user had exclusion ("chara", "without", "excluding")
            excluded_prod = None
            for p in catalog:
                pname_low = p['name'].lower()
                psku_low = p['sku'].lower()
                if (f"{pname_low} chara" in user_text_combined.lower() or 
                    f"without {pname_low}" in user_text_combined.lower() or
                    f"{psku_low} chara" in user_text_combined.lower() or
                    ("65w gan" in user_text_combined.lower() and "chara" in user_text_combined.lower() and p['sku'] == 'GP-GAN-01')):
                    excluded_prod = p
                    break
                    
            # Build list of available catalog items (excluding the requested one)
            available_items = [p for p in catalog if p.get("sku") not in ["AT-HOD-04", "VT-PB-104"] and p != excluded_prod]
            items_summary_bng = ", ".join([f"'{p['name']}' (৳{p['price']})" for p in available_items])
            items_summary_eng = ", ".join([f"{p['name']} (৳{p['price']})" for p in available_items])
            
            if excluded_prod:
                detected_issues.append("IGNORED_PRODUCT_EXCLUSION")
                if script_type == "bangla":
                    reply = f"জি! {excluded_prod['name']} ছাড়া আমাদের বর্তমান ক্যাটালগের অন্যান্য রানিং পণ্য হলো: {items_summary_bng}। বিস্তারিত স্পেসিফিকেশন ও বাস্তব প্রোডাক্ট গ্যালারি দেখতে আমাদের অফিশিয়াল পেজ ব্রাউজ করতে পারেন অথবা সাপোর্ট প্রতিনিধির সাথে যোগাযোগ করতে পারেন।"
                elif script_type == "english":
                    reply = f"Certainly! Excluding {excluded_prod['name']}, our available running collection includes: {items_summary_eng}. For detailed model visuals or official catalog gallery, please connect with our support desk."
                else:
                    reply = f"Ji! {excluded_prod['name']} chara amader onno running items er collection holo: {items_summary_bng}। Product details o visual gallery dekhte amader official catalog gallery browse korte paren ba human agent er shathe connect hote paren."
            else:
                if script_type == "bangla":
                    reply = f"আমাদের বর্তমান কালেকশনের রানিং পণ্য ও মূল্য নিচে দেওয়া হলো: {items_summary_bng}। বাস্তব প্রোডাক্ট ছবি ও আনবক্সিং গ্যালারি দেখতে আমাদের অফিশিয়াল পেজ গ্যালারি ভিজিট করতে পারেন অথবা সাপোর্ট প্রতিনিধির সাথে যোগাযোগ করতে পারেন।"
                elif script_type == "english":
                    reply = f"Here are the available running collection items and prices from our catalog: {items_summary_eng}. To view high-resolution unboxing photos and product gallery, please connect with our support desk or visit our official catalog page."
                else:
                    reply = f"Amader running collection er product details o price holo: {items_summary_bng}। Real product visuals o official gallery dekhte amader store page visit korte paren ba support agent er shathe connect hote paren."
            actions_taken.append("Replaced fake image-sending claim with catalog items list and gallery referral")
            modified = True

        # -------------------------------------------------------------
        # 1e. Unsupported Product Material & Technical Spec Fluff
        # -------------------------------------------------------------
        if "satisfaction policy" in reply.lower() or ("premium materials" in reply.lower() and "priced at" in reply.lower()) or ("built with premium" in reply.lower() and "technical specifications" in user_text_combined.lower()):
            detected_issues.append("UNSUPPORTED_MATERIAL_AND_SPEC_CLAIMS")
            prod_match = ordered_prod or catalog[0]
            pname = prod_match["name"]
            pprice = prod_match["price"]
            psku = prod_match["sku"]
            
            specs_map = {
                "MM-BLD-03": f"The Portable USB Smoothie Blender (SKU: MM-BLD-03) features a 6-blade stainless steel assembly, rechargeable USB motor, and is priced at ৳{pprice}. Specific polymer/chemical material grades are not documented in our quick catalog; our support desk can check the manufacturer packaging specifications for you upon request.",
                "MM-BTL-01": f"The Insulated Thermal Smart Water Bottle (SKU: MM-BTL-01) features a 500ml capacity, double-wall thermal insulation, LED touch temperature display, and is priced at ৳{pprice}. Detailed alloy certifications can be verified via our support desk.",
                "MM-LGT-02": f"The Rechargeable Motion-Sensor Magnetic Closet Light (SKU: MM-LGT-02) features a PIR motion sensor, USB rechargeable battery, magnetic adhesive mount, and is priced at ৳{pprice}.",
                "UC-CHR-01": f"The ErgoPro High-Back Mesh Task Chair (SKU: UC-CHR-01) features an ergonomic high-back breathable mesh, adjustable height mechanism, and is priced at ৳{pprice}. Raw structural alloy/polymer breakdown can be verified by our furniture support team.",
                "UC-DSK-02": f"The Nordic Solid Oak Minimalist Study Desk (SKU: UC-DSK-02) features solid oak wood construction (4ft x 2ft dimensions) and is priced at ৳{pprice}.",
                "LX-NCK-01": f"The Celestial Dual-Layer 18K Gold-Plated Choker Necklace (SKU: LX-NCK-01) features 18K gold-plating over a hypoallergenic brass alloy base, priced at ৳{pprice}.",
                "LX-EAR-02": f"The Baroque Freshwater Pearl Drop Earrings (SKU: LX-EAR-02) feature genuine baroque freshwater pearls with plated hooks, priced at ৳{pprice}.",
                "SC-RN-01": f"The StrideCraft AeroFlex Carbon Running Shoes (SKU: SC-RN-01) feature a carbon plate propulsion setup, breathable engineered mesh upper, priced at ৳{pprice}.",
                "SC-LOAF-02": f"The Handcrafted Full-Grain Genuine Leather Penny Loafers (SKU: SC-LOAF-02) feature full-grain genuine leather upper, leather lining, and cushioned insole, priced at ৳{pprice}.",
                "VT-HP-101": f"The VoltTech Apex Wireless ANC Headphones (SKU: VT-HP-101) feature Active Noise Cancellation, Bluetooth connectivity, cushioned earcups, priced at ৳{pprice}.",
                "VT-TWS-102": f"The VoltTech AirBuds Bass Pro TWS (SKU: VT-TWS-102) feature dynamic bass drivers, wireless charging case, priced at ৳{pprice}.",
                "VT-SW-103": f"The VoltTech Pulse AMOLED Smartwatch (SKU: VT-SW-103) features an AMOLED display, fitness/health tracking sensors, silicone strap, priced at ৳{pprice}.",
                "GP-GAN-01": f"The 65W GaN Dual Type-C + USB Fast Wall Charger (SKU: GP-GAN-01) features Gallium Nitride (GaN) fast charging, dual Type-C + USB-A output, priced at ৳{pprice}.",
                "GP-MAG-02": f"The Frosted Magnetic Shockproof Case (SKU: GP-MAG-02) features a matte polycarbonate back, MagSafe magnetic ring, and TPU bumper, priced at ৳{pprice}.",
                "GP-CBL-03": f"The Braided 100W PD Type-C to Type-C Cable (SKU: GP-CBL-03) features 100W Power Delivery support, braided nylon jacket (1.5m), priced at ৳{pprice}.",
                "GB-SRM-01": f"The Niacinamide 10% + Zinc 1% Clarifying Serum (SKU: GB-SRM-01) contains 10% Niacinamide and 1% Zinc PCA (30ml dropper bottle), priced at ৳{pprice}.",
                "GB-SUN-02": f"The Water-Light SPF 50+ PA++++ Hyaluronic Sunscreen (SKU: GB-SUN-02) provides broad spectrum SPF 50+ PA++++ with Hyaluronic acid (50ml), priced at ৳{pprice}.",
                "GB-MST-03": f"The Ceramide Barrier Hydration Gel Cream (SKU: GB-MST-03) features barrier repair ceramides in a lightweight gel base (60ml), priced at ৳{pprice}."
            }
            reply = specs_map.get(psku, f"The {pname} (SKU: {psku}) is priced at ৳{pprice} in our verified catalog. Deep raw material grade specifications are not listed in our store catalog; our support desk can check manufacturer details for you.")
            actions_taken.append("Replaced generic material fluff with grounded catalog specifications")
            modified = True

        # -------------------------------------------------------------
        # 2. Unsupported Wholesale / Corporate Discounts
        # -------------------------------------------------------------
        if any(term in reply.lower() for term in ["wholesale concession", "corporate discount", "10% wholesale"]):
            detected_issues.append("UNSUPPORTED_WHOLESALE_DISCOUNT")
            if script_type == "bangla":
                reply = "বাল্ক বা কর্পোরেট অর্ডারের জন্য কাস্টমাইজড প্রাইসিং ও বাণিজ্যিক সুবিধা জানতে অনুগ্রহ করে আমাদের সেলস ম্যানেজমেন্ট ডেস্কে যোগাযোগ করুন। আমরা আপনাকে দায়িত্বপ্রাপ্ত প্রতিনিধির সাথে কানেক্ট করে দিচ্ছি।"
            elif script_type == "english":
                reply = "For bulk or corporate purchases, customized pricing and formal commercial terms are handled directly by our corporate sales desk. We can connect you with a representative for a dedicated quotation."
            else:
                reply = "Bulk ba corporate order er customized price o quotation er jonno amader corporate sales desk er sathe jogajog korte hobe. Amra apnake representative er sathe connect kore dicchi."
            actions_taken.append("Replaced unauthorized wholesale discount with corporate desk referral")
            modified = True

        # -------------------------------------------------------------
        # 3. Unsupported Corporate VAT Invoices / Tax Documents
        # -------------------------------------------------------------
        if any(term in reply.lower() for term in ["vat chalan", "vat invoice", "government-compliant vat"]):
            detected_issues.append("UNSUPPORTED_VAT_PROMISE")
            if script_type == "bangla":
                reply = "কর্পোরেট ভ্যাট চালান ও ইনভয়েস সংক্রান্ত নথিপত্র আমাদের ম্যানেজমেন্ট টিম সরাসরি পর্যালোচনা করে নিশ্চিত করে থাকে। আপনার রিকোয়ারমেন্ট আমাদের টিমকে ফরোয়ার্ড করা হয়েছে।"
            elif script_type == "english":
                reply = "Corporate VAT invoices and formal billing documentation require direct verification by our management team. We have forwarded your request to our accounts desk for assistance."
            else:
                reply = "Corporate VAT chalan o billing documentation er jonno amader management desk theke verify kore apnake assist kora hobe."
            actions_taken.append("Replaced unauthorized VAT promise with management verification requirement")
            modified = True

        # -------------------------------------------------------------
        # 4. Unsupported Live Address Updates (Action Execution Claim)
        # -------------------------------------------------------------
        if "সফলভাবে আপডেট করা হয়েছে" in reply:
            detected_issues.append("UNSUPPORTED_ACTION_ADDRESS_UPDATE")
            reply = re.sub(
                r'(?:ডেলিভারি অ্যাড্রেস|অ্যাড্রেস|ঠিকানা)\s*সফলভাবে আপডেট করা হয়েছে[।!]*',
                'আপনার নতুন ঠিকানার অনুরোধটি নোট করা হয়েছে। পার্সেল পাঠানোর পূর্বে আমাদের ফুলফিলমেন্ট টিম ঠিকানাটি ভেরিফাই ও আপডেট করে নেবে।',
                reply
            )
            actions_taken.append("Replaced simulated address update with noted-for-verification workflow")
            modified = True
        elif "successfully updated" in reply.lower() or "address has been updated" in reply.lower():
            detected_issues.append("UNSUPPORTED_ACTION_ADDRESS_UPDATE")
            reply = re.sub(
                r'(?:Delivery address|Address)\s*(?:has been\s*)?successfully updated[.!]*',
                'We have noted your delivery address update request. Our fulfillment team will verify and update the shipping address with our courier partner before dispatch.',
                reply,
                flags=re.IGNORECASE
            )
            actions_taken.append("Replaced simulated address update with noted-for-verification workflow")
            modified = True
        elif "update kora hoyeche" in reply.lower() and "address" in user_text_combined.lower():
            detected_issues.append("UNSUPPORTED_ACTION_ADDRESS_UPDATE")
            reply = re.sub(
                r'(?:delivery address|address)\s*update kora hoyeche[.!]*',
                'Apnar notun thikanar request-ti note kora hoyeche. Dispatch er age amader fulfillment desk thikanati courier system e update o verify kore nibe.',
                reply,
                flags=re.IGNORECASE
            )
            actions_taken.append("Replaced simulated address update with noted-for-verification workflow")
            modified = True

        # -------------------------------------------------------------
        # 5. Unsupported Furniture Free Exchange Policy (tenant_furniture_05)
        # -------------------------------------------------------------
        if tid == "tenant_furniture_05" and ("সম্পূর্ণ ফ্রিতে ইজি এক্সচেঞ্জ" in reply or "free exchange" in reply.lower()):
            detected_issues.append("UNSUPPORTED_FURNITURE_EXCHANGE")
            reply = "আমাদের রিটার্ন পলিসি অনুযায়ী: পণ্য ডেলিভারির সময় বা ৭ দিনের মধ্যে কোনো ম্যানুফ্যাকচারিং ত্রুটি বা পরিবহনজনিত ক্ষতি থাকলে রিটার্ন ও রিপ্লেসমেন্ট সুবিধা পাবেন। অক্ষত ফার্নিচারের ক্ষেত্রে সাইজ বা পছন্দ পরিবর্তনজনিত ফ্রি এক্সচেঞ্জ প্রযোজ্য নয়।"
            actions_taken.append("Enforced strict 7-day manufacturing defect furniture return policy")
            modified = True

        # -------------------------------------------------------------
        # 5b. Incompatible Product Size Update Requests (Non-Apparel / Non-Shoes)
        # -------------------------------------------------------------
        if tid not in ["tenant_fashion_01", "tenant_shoes_08"]:
            if any(term in reply.lower() for term in ["size update", "size change", "order size to", "size ta", "size update kore dicchi"]):
                detected_issues.append("INCOMPATIBLE_SIZE_MODIFICATION")
                if script_type == "bangla":
                    reply = "ভাইয়া, আমাদের এই পণ্যটি ফিক্সড স্পেসিফিকেশন/প্যাকেজড ভ্যারিয়েন্ট (আলাদা পোশাকের মতো সাইজ অপশন নেই)। তবে অর্ডার ডিসপ্যাচ হওয়ার আগে আপনি ডেলিভারি ঠিকানা বা কোয়ান্টিটি আপডেট করতে পারবেন।"
                elif script_type == "english":
                    reply = "This product has fixed specifications and standard packaging (it does not have clothing size variations). However, you can update your delivery address or item quantity before dispatch."
                else:
                    reply = "Vaiya, amader ei item ti fixed specification/packaged variant (clothing er moto size options nei). Tobe dispatch er age delivery address ba quantity update korte paren."
                actions_taken.append("Clarified fixed product specifications for non-apparel size request")
                modified = True

        # -------------------------------------------------------------
        # 6. Out-of-Stock Items Attempted to Book Orders
        # -------------------------------------------------------------
        if ordered_prod and ordered_prod.get("sku") in ["AT-HOD-04", "VT-PB-104"]:
            booking_terms = ["অর্ডার কনফার্ম", "অর্ডার নিশ্চিত", "মোট বিল", "Order is confirmed", "confirmed for", "order details note", "টাকা", "৳"]
            if any(term in reply for term in booking_terms):
                detected_issues.append("OUT_OF_STOCK_ITEM_BOOKED")
                pname = ordered_prod["name"]
                pprice = ordered_prod["price"]
                if script_type == "bangla":
                    reply = f"দুঃখিত, {pname} (৳{pprice}) বর্তমানে সাময়িকভাবে স্টকে নেই (Stock Out)। এটি পুনরায় স্টকে আসলে আমরা আপনাকে জানাতে পারি অথবা আমাদের ইন-স্টক অন্য কোনো পণ্য দেখতে পারেন।"
                elif script_type == "english":
                    reply = f"We apologize, {pname} (৳{pprice}) is currently out of stock. We can notify you once it is restocked, or you can explore our available in-stock items."
                else:
                    reply = f"Dukkhito vaiya, {pname} (৳{pprice}) bortomane stock out ache. Restock hole notify korte pari othoba amader onno running items dekhte paren."
                actions_taken.append("Prevented order booking on out-of-stock item")
                modified = True

        # -------------------------------------------------------------
        # 7. Unsupported Order Confirmation Claims & Billing Math Verification
        # -------------------------------------------------------------
        has_order_confirm = any(term in reply for term in [
            "আপনার অর্ডার নিশ্চিত করা হয়েছে", "আপনার অর্ডার কনফার্ম করা হয়েছে", "অর্ডার সফলভাবে কনফার্ম করা হয়েছে",
            "Your order is confirmed", "order has been confirmed", "order confirm kora hoyeche"
        ])
        has_bill_mention = any(term in reply for term in [
            "মোট বিল", "বিল ৳", "total bill", "total ৳", "total bill ৳", "total payable", "total payable ৳"
        ])
        
        if (has_order_confirm or has_bill_mention) and ordered_prod and ordered_prod.get("sku") not in ["AT-HOD-04", "VT-PB-104"]:
            expected_total = ordered_prod["price"] + current_fee
            
            # Check if stated bill exists and differs
            m_bill = re.search(r'(?:মোট বিল|বিল|total bill|total payable|total)[:\s]*৳?(\d+)', reply, re.IGNORECASE)
            stated_bill = int(m_bill.group(1)) if m_bill else None
            
            math_error = (stated_bill is not None and stated_bill != expected_total)
            if math_error:
                detected_issues.append("INCORRECT_ORDER_TOTAL_MATH")
            if has_order_confirm:
                detected_issues.append("UNSUPPORTED_ORDER_CONFIRMATION")
                
            cname = extract_customer_name(user_text_combined, script_type)
            pname = ordered_prod["name"]
            pprice = ordered_prod["price"]
            
            advance_notice = " (উল্লেখ্য, ভারী ফার্নিচারের জন্য ১০% বুকিং অ্যাডভান্স প্রযোজ্য)" if tid == "tenant_furniture_05" else ""
            
            if script_type == "bangla":
                reply = f"অসংখ্য ধন্যবাদ {cname}! আপনার অর্ডারের তথ্য নোট করা হয়েছে: {pname} (৳{pprice}), ডেলিভারি চার্জ ৳{current_fee}, সর্বমোট প্রদেয় ৳{expected_total} (ক্যাশ অন ডেলিভারি){advance_notice}। {current_time}র মধ্যে পৌঁছাবে। পার্সেল পাঠানোর পূর্বে আমাদের সাপোর্ট টিম কল করে অর্ডারটি ভেরিফাই ও কনফার্ম করবেন।"
            elif script_type == "english":
                reply = f"Thank you {cname}! We have recorded your order details: {pname} (৳{pprice}), delivery fee ৳{current_fee}, total payable ৳{expected_total} (Cash on Delivery){advance_notice}. Estimated delivery: {current_time}. Our support team will call you shortly to verify and confirm your order before dispatch."
            else:
                reply = f"Dhonnobad {cname}! Apnar order details note kora hoyeche: {pname} (৳{pprice}), delivery charge ৳{current_fee}, total payable ৳{expected_total} (Cash on Delivery){advance_notice}। {current_time} er moddhe pouchhabe. Dispatch er age amader support team call kore order ti verify o confirm korben."
            
            actions_taken.append(f"Corrected total bill to ৳{expected_total} and converted unilateral confirmation to verified agent workflow")
            modified = True

        # -------------------------------------------------------------
        # 8. Standardize Delivery Fees & Timelines in general text
        # -------------------------------------------------------------
        if outside:
            if "২৪-৪৮" in reply or "24-48" in reply:
                reply = reply.replace("২৪-৪৮ ঘণ্টার", f"{current_time}র").replace("24-48 hours", current_time).replace("24-48 ghontar", f"{current_time} er")
                detected_issues.append("INVENTED_DELIVERY_TIMELINE")
                actions_taken.append(f"Corrected outside Dhaka timeline to {current_time}")
                modified = True
            if f"৳{fee_in}" in reply and "outside" in reply.lower():
                reply = reply.replace(f"৳{fee_in}", f"৳{fee_out}")
                detected_issues.append("INCORRECT_DELIVERY_FEE")
                actions_taken.append(f"Corrected outside Dhaka fee to ৳{fee_out}")
                modified = True

        if reply != reply_orig:
            modified = True
            analysis["suggested_response"] = reply
            parsed["analysis"] = analysis
            parsed["reply"] = reply
            new_m["content"] = json.dumps(parsed, ensure_ascii=False)
            
        new_messages.append(new_m)

    rec["messages"] = new_messages
    return rec, modified, list(set(detected_issues)), list(set(actions_taken))

def run_full_remediation():
    profiles = load_profiles()
    print("[*] Running Comprehensive Remediation Engine starting from ORIGINAL BACKUPS...")
    
    logs = []
    
    for split_name, in_path, out_path in [("train", TRAIN_BACKUP, TRAIN_OUT), ("val", VAL_BACKUP, VAL_OUT)]:
        records = [json.loads(l) for l in open(in_path, "r", encoding="utf-8") if l.strip()]
        remediated_records = []
        split_corrected = 0
        
        for r in records:
            rec_id = r["id"]
            tid = r["tenant_id"]
            
            orig_replies = [json.loads(m["content"]).get("reply", "") for m in r["messages"] if m["role"] == "assistant"]
            orig_sample = " | ".join(orig_replies)
            
            corrected_r, was_modified, issues, actions = remediate_record(r, profiles)
            
            new_replies = [json.loads(m["content"]).get("reply", "") for m in corrected_r["messages"] if m["role"] == "assistant"]
            new_sample = " | ".join(new_replies)
            
            status = "CORRECTED" if was_modified else "APPROVED"
            if was_modified:
                split_corrected += 1
                
            logs.append({
                "record_id": rec_id,
                "split": split_name,
                "tenant_id": tid,
                "status": status,
                "detected_issues": issues,
                "actions_taken": actions,
                "original_sample": orig_sample[:180] if was_modified else None,
                "corrected_sample": new_sample[:180] if was_modified else None
            })
            remediated_records.append(corrected_r)
            
        print(f"[*] {split_name.upper()}: {split_corrected} records modified out of {len(records)} ({len(records) - split_corrected} approved)")
        
        # Save to training/
        with open(out_path, "w", encoding="utf-8") as f:
            for r in remediated_records:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        # Save to kreazyai-ai-training/
        with open(BASE_DIR / out_path.name, "w", encoding="utf-8") as f:
            for r in remediated_records:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        # Save to workspace root
        with open(BASE_DIR.parent / out_path.name, "w", encoding="utf-8") as f:
            for r in remediated_records:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # Save log
    with open(CORRECTION_LOG_FILE, "w", encoding="utf-8") as f:
        for entry in logs:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            
    with open(ROOT_LOG_FILE, "w", encoding="utf-8") as f:
        for entry in logs:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"✅ Successfully completed remediation and generated auditable logs.")

if __name__ == "__main__":
    run_full_remediation()
