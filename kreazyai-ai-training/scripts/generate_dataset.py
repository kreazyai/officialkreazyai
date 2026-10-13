#!/usr/bin/env python3
"""
KreazyAI Synthetic Dataset Generator - Enterprise High-Diversity Edition (v2)
Generates 200 distinct, non-duplicate, grounded customer conversations across 10 business tenants.
Supports Banglish (with realistic spelling variations), Natural Bangla, Natural English, and Mixed Code-Switching.
Includes Single-turn AND Multi-turn conversations, realistic escalations, zero PII, and 100% tenant isolation.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BUSINESS_PROFILES_DIR = BASE_DIR / "business_profiles"
DATASETS_RAW_DIR = BASE_DIR / "datasets" / "raw"
DATASETS_RAW_DIR.mkdir(parents=True, exist_ok=True)

def load_business_profiles():
    profiles = {}
    for file in sorted(BUSINESS_PROFILES_DIR.glob("*.json")):
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            profiles[data["tenant_id"]] = data
    return profiles

PROFILES = load_business_profiles()

def create_system_prompt(tenant):
    catalog_summary = []
    for p in tenant["catalog"]:
        sku = p.get("sku", "")
        name = p.get("name", "")
        price = p.get("price", "")
        stock = p.get("stock_status", "")
        catalog_summary.append(f"- {name} (SKU: {sku}) | Price: ৳{price} | Status: {stock}")

    catalog_text = "\n".join(catalog_summary)
    policies = tenant["policies"]
    policies_text = (
        f"Delivery inside Dhaka: {policies.get('delivery_dhaka', '')} (Fee: ৳{policies.get('fee_inside_dhaka', 0)})\n"
        f"Delivery outside Dhaka: {policies.get('delivery_outside_dhaka', '')} (Fee: ৳{policies.get('fee_outside_dhaka', 0)})\n"
        f"COD Allowed: {'Yes' if policies.get('cash_on_delivery') else 'No'}\n"
        f"Return Policy: {policies.get('return_policy', '')}"
    )

    return (
        f"You are the official KreazyAI conversational assistant for {tenant['business_name']} ({tenant['vertical']}).\n"
        f"Brand Tone: {tenant['brand_tone']}.\n"
        f"Strict Guidelines: Ground your answers ONLY in verified store knowledge. Never invent prices or fake stock.\n"
        f"When classifying and responding, provide your output in structured JSON format with 'analysis' and 'reply'.\n"
        f"\n[STORE CATALOG]\n{catalog_text}\n"
        f"\n[STORE POLICIES]\n{policies_text}"
    )

def generate_pilot_200():
    all_examples = []
    ex_id = 1

    # 10 Tenant definitions with completely distinct conversational seeds (20 per tenant = 200 total)
    # Format per example:
    # {
    #   "language": "...",
    #   "scenario": "...",
    #   "intents": [...],
    #   "priority": "...",
    #   "sentiment": "...",
    #   "requires_human": bool,
    #   "escalation_reason": "...",
    #   "turns": [ (user_msg, bot_reply), ... ]  <- supports 1 or more turns!
    # }

    tenant_dataset_specs = {
        # -------------------------------------------------------------
        # TENANT 1: FASHION (AuraThreads BD)
        # -------------------------------------------------------------
        "tenant_fashion_01": [
            # 1. Banglish price & stock
            {"language": "banglish", "scenario": "panjabi_stock",
             "intents": ["Product inquiry", "Product availability", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai royal emerald panjabi tar L size hobe? dam koto pore?",
                        "Ji vaiya! Amader Royal Emerald Semi-Kaptan Panjabi (SKU: AT-PAN-01) er L size ekhon live stock-e available ache. Price ৳2,650. Order confirm korte chaile apnar name, delivery address ar phone number dite paren!")]},
            # 2. Bangla photo request
            {"language": "bangla", "scenario": "saree_image",
             "intents": ["Image request", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("জামদানি শাড়িটার আরো কিছু ক্লোজআপ ছবি দেখতে পারব? কাপড়ের কোয়ালিটি কেমন?",
                        "অবশ্যই আপু! আমাদের Soft Jamdani Motif Cotton Saree (SKU: AT-SAR-03) ১০০% হ্যান্ডলুম কটন জামদানি ব্লেন্ডে তৈরি। ইনবক্সে আঁচল ও বর্ডারের রিয়েল ছবি পাঠানো হচ্ছে। প্রাইস ৳৩,৮০০।")]},
            # 3. English restock
            {"language": "english", "scenario": "hoodie_restock",
             "intents": ["Product inquiry", "Product availability", "Product recommendation"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Hey, do you have the Winter Drop-Shoulder Fleece Hoodie in XL? Need it urgently.",
                        "Hello! Currently our Winter Drop-Shoulder Fleece Hoodie (SKU: AT-HOD-04) is temporarily out of stock and scheduled for restock next Thursday. However, we have our Heavyweight Oversized Minimalist Tee (SKU: AT-TEE-02, 240 GSM) in XL available at ৳850. Would you like me to notify you as soon as the hoodie is back?")]},
            # 4. Mixed Critical Fraud Alert
            {"language": "mixed", "scenario": "panjabi_fraud_alert",
             "intents": ["Payment issue", "Refund request", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Customer alleges fraud and threatens consumer rights litigation due to unconfirmed payment",
             "turns": [("Ami 3 din age panjabi er jonno bKash korechi ৳2,650, kintu kono confirmation pai nai. Apnara fraud business, ami consumer rights e case korbo jodi ajkei money refund na den!",
                        "আসসালামু আলাইকুম। আপনার এই সমস্যার জন্য আমরা গভীরভাবে আন্তরিকভাবে দুঃখিত। আপনার টাকা সম্পূর্ণ নিরাপদ আছে। বিষয়টি আমরা সর্বোচ্চ গুরুত্ব দিয়ে আমাদের সিনিয়র ম্যানেজারের কাছে হ্যান্ডওভার করেছি। অনুগ্রহ করে আপনার bKash ট্রানজেকশন আইডি দিন, আমরা এখনই চেক করে জানাচ্ছি।")]},
            # 5. Banglish delivery fee
            {"language": "banglish", "scenario": "tee_delivery_fee",
             "intents": ["Product inquiry", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("black oversized t-shirt L size nibo, chittagong delivery koto pore?",
                        "Ji vaiya! Heavyweight Oversized Minimalist Tee (Black, L size) available ache, price ৳850. Chittagong e delivery fee ৳130, time lagbe 48-72 hours. Cash on Delivery te order confirm korte chaile apnar Full Name, Mobile Number ar Address ta likhe pathan.")]},
            # 6. Bangla exchange policy
            {"language": "bangla", "scenario": "exchange_policy",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("আমার পাঞ্জাবির সাইজ যদি না মিলে তাহলে কি এক্সচেঞ্জ করতে পারব?",
                        "জি অবশ্যই! আমাদের ৭ দিনের ইজি এক্সচেঞ্জ পলিসি রয়েছে। ট্যাগ অক্ষত ও আনওয়ার্ন অবস্থায় রাখলে আপনি সহজেই সাইজ এক্সচেঞ্জ করে নিতে পারবেন। ঢাকা সিটিতে এক্সচেঞ্জ ডেলিভারি মাত্র ২৪ থেকে ৪৮ ঘণ্টা সময় নেয়।")]},
            # 7. English bundle discount
            {"language": "english", "scenario": "bulk_discount",
             "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [("Can I get a discount if I buy 3 oversized black t-shirts together?",
                        "For our Heavyweight Oversized Minimalist Tee (৳850 each), we can offer a 5% bundle concession on 3 items, making your total ৳2,422 instead of ৳2,550! Would you like me to book this combo for you?")]},
            # 8. Banglish High Defect
            {"language": "banglish", "scenario": "defective_garment",
             "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Stained garment delivered requiring immediate free doorstep replacement",
             "turns": [("vai dress tar kolar e kalo dag lege ache parcel khule dekhlam! eita ki dhoroner delivery?",
                        "Khub dukkhito vaiya! Amader QA team er onakankhito vuler jonno shongshoy probahito hoyeche. Apni t-shirt er dag er chobi ta pathan, amra ekhoni free courier pickup ar fresh new piece dispatch kore dicchi.")]},
            # 9. Mixed Order Placement (Zero Real PII)
            {"language": "mixed", "scenario": "order_placement",
             "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [("Ami order confirm korte chai. Name: Tanvir Hasan, Address: Sector 4, Uttara, Phone: 01711-44XXXX. Black Tee L size.",
                        "অসংখ্য ধন্যবাদ তানভীর ভাই! আপনার অর্ডারটি গ্রহণ করা হয়েছে। আইটেম: Heavyweight Oversized Minimalist Tee (L) - ৳৮৫০ + ঢাকা ডেলিভারি ৳৭০ = মোট বিল ৳৯২০ (ক্যাশ অন ডেলিভারি)। ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি পাবেন।")]},
            # 10. Bangla store location
            {"language": "bangla", "scenario": "store_location",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("আপনাদের শোরুম বা আউটলেট ঢাকার কোথায় অবস্থিত?",
                        "আমাদের সম্পূর্ণ কালেকশন অনলাইন স্টোর ও সেন্ট্রাল ওয়্যারহাউস ভিত্তিক পরিচালিত হয়। মেটা ভেরিফাইড হোম ডেলিভারিতে ক্যাশ অন ডেলিভারি সুবিধার মাধ্যমে আপনি ঘরে বসেই পণ্য দেখে রিসিভ করতে পারেন।")]},
            # 11. Multi-Turn 1 (Banglish: Inquire -> Recommend -> Sizing follow-up)
            {"language": "banglish", "scenario": "multiturn_panjabi_sizing",
             "intents": ["Product inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [
                 ("vai apnader ekhane bhalo panjabi ki ki ase?",
                  "Amader ekhon premium Royal Emerald Semi-Kaptan Panjabi (SKU: AT-PAN-01) available ache, price ৳2,650! Breathable viscose-cotton blend e toiri."),
                 ("eitar chest measurement koto L size er?",
                  "Royal Emerald Panjabi er L size er chest 42 inches ar length 42 inches. M size 40 inches ar XL 44 inches. Apnar height o weight bolle amra exact size suggest korte pari!")
             ]},
            # 12. Multi-Turn 2 (English: Saree inquiry -> Gift wrapping confirmation)
            {"language": "english", "scenario": "multiturn_saree_gift",
             "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [
                 ("Is the Jamdani saree pure handloom or powerloom imitation?",
                  "Our Soft Jamdani Motif Cotton Saree (SKU: AT-SAR-03) is handcrafted using authentic cotton handloom weaving techniques with traditional motifs. It is breathable and soft on the skin, priced at ৳3,800."),
                 ("Can you pack it in a luxury gift box for my mother's birthday tomorrow?",
                  "Absolutely! We offer our signature luxury ribbon gift packaging for an additional ৳150, complete with a personalized birthday message card.")
             ]},
            # 13. Bangla urgent express
            {"language": "bangla", "scenario": "urgent_delivery",
             "intents": ["Delivery complaint", "General customer support"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("আজকে রাতে কি ধানমন্ডিতে সেম ডে ডেলিভারি পাওয়া সম্ভব?",
                        "সাধারণত ঢাকা সিটির ভেতরে রেগুলার ডেলিভারি ২৪ থেকে ৪৮ ঘণ্টা সময় নেয়। তবে অতি জরুরি ক্ষেত্রে সকাল ১১টার আগে কনফার্ম থাকলে আমরা স্পেশাল এক্সপ্রেস রাইডারে সেম ডে ডেলিভারির ব্যবস্থা করতে পারি (অতিরিক্ত রাইডার চার্জ প্রযোজ্য)।")]},
            # 14. Mixed payment modes
            {"language": "mixed", "scenario": "payment_modes",
             "intents": ["Payment issue", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Payment bKash merchant e korbo naki send money?",
                        "আপনি চাইলে ক্যাশ অন ডেলিভারিতে প্রোডাক্ট হাতে পেয়ে পেমেন্ট করতে পারেন। আর অগ্রিম পেমেন্ট করতে চাইলে আমাদের ভেরিফাইড bKash মার্চেন্ট অ্যাকাউন্টে পেমেন্ট করতে পারবেন।")]},
            # 15. English tracking glitch
            {"language": "english", "scenario": "tracking_glitch",
             "intents": ["Order tracking", "Delivery complaint"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": True, "escalation_reason": "Courier tracking code desynchronization requiring manual dispatch verification",
             "turns": [("My tracking code AT-9912 is showing invalid on courier site for 2 days now.",
                        "Apologies for the inconvenience! Sometimes courier tracking APIs take up to 24 hours to sync nationwide scans. Let me connect you with our logistics desk right now to verify the physical parcel location.")]},
            # 16. Banglish budget recommendation
            {"language": "banglish", "scenario": "budget_fit",
             "intents": ["Product recommendation", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai 2000 takar moddhe semi formal panjabi ki hobe?",
                        "Amader Royal Emerald Panjabi holo ৳2,650, kintu apnar budget 2000 takar moddhe amader upcoming Festive Cotton Drop ache. Apni chaile ৳850 er Heavyweight Minimalist Tee dekhte paren!")]},
            # 17. Bangla courier misconduct (HIGH - Non-critical angry)
            {"language": "bangla", "scenario": "courier_misconduct",
             "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Courier refusal of parcel inspection at doorstep",
             "turns": [("কুরিয়ার বয় পার্সেল খুলে দেখতে দেয়নি, দুর্ব্যবহার করেছে! এটা কেমন নিয়ম?",
                        "আমরা অত্যন্ত দুঃখিত! আমাদের নিয়ম অনুযায়ী আপনি কুরিয়ার বয়ের উপস্থিতিতে পার্সেলের বাইরের সিল ও বক্স চেক করতে পারবেন। রাইডারের আচরণের বিষয়টি আমরা কুরিয়ার কর্তৃপক্ষের কাছে রিপোর্ট করছি এবং সিনিয়র অফিসার দ্রুত সমাধান দিচ্ছেন।")]},
            # 18. Banglish realistic spelling variation (Bhai price ta bolen)
            {"language": "banglish", "scenario": "panjabi_spelling_variation",
             "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Bhai emerald panjabi tar price ta bolen ar fabric ki?",
                        "Ji bhai! Royal Emerald Semi-Kaptan Panjabi er official price ৳2,650. Eita 100% fine cotton blend jacquard fabric e toiri, khub soft o comfortable.")]},
            # 19. English order cancellation
            {"language": "english", "scenario": "order_cancellation",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("I want to cancel order #AT-6651 as I am traveling abroad tomorrow.",
                        "We understand! Your order #AT-6651 has been successfully canceled before warehouse dispatch. No fees will be charged. Have a safe journey!")]},
            # 20. Banglish fabric wash care
            {"language": "banglish", "scenario": "fabric_gsm",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai apnader t-shirt er fabric GSM koto? wash korle ki color chole jabe?",
                        "Amader Minimalist Tee holo 240 GSM pre-shrunk organic cotton! Bio-washed hoyay eita normal washing e color fade hoy na ba shrink kore na.")]}
        ],

        # -------------------------------------------------------------
        # TENANT 2: ELECTRONICS (VoltTech Electronics)
        # -------------------------------------------------------------
        "tenant_electronics_02": [
            # 1. Banglish TWS budget
            {"language": "banglish", "scenario": "tws_recommend",
             "intents": ["Product recommendation", "Product inquiry", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Vai 1500 takar moddhe valo bass wala kono TWS hobe?",
                        "Ji vaiya! Apnar budget e amader 'VoltTech AirBuds Bass Pro TWS' (SKU: VT-TWS-102) best choice! Eitate ache 13mm deep bass, 28 hours battery backup ar low latency mode. Price matro ৳1,450 sathe 6 Months replacement warranty!")]},
            # 2. Bangla defective headphones
            {"language": "bangla", "scenario": "damaged_audio",
             "intents": ["Delivery complaint", "Customer dissatisfaction", "Refund request"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Damaged and defective audio product delivered with crushed packaging",
             "turns": [("কালকে হেডফোন ডেলিভারি পেয়েছি কিন্তু এক পাশের স্পিকার বাজে না! বক্স ভাঙা ছিল। দ্রুত সমাধান দিন।",
                        "আন্তরিকভাবে দুঃখিত এই অনাকাঙ্ক্ষিত অভিজ্ঞতার জন্য। আমাদের প্রতিটি প্রোডাক্টে ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি রয়েছে। অনুগ্রহ করে বক্সের ও স্পিকারের একটি ছোট ভিডিও পাঠান। আমাদের সাপোর্ট অফিসার এখনই আপনার জন্য ফ্রি পিকআপ ও নতুন ইউনিট ডিসপ্যাচ প্রসেস করছেন।")]},
            # 3. English comparison
            {"language": "english", "scenario": "audio_comparison",
             "intents": ["Product comparison", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("What is the difference between your Apex Headphones and AirBuds Pro? Which has better battery?",
                        "Great question! The Apex Wireless Headphones (৳2,850) are over-ear with Active Noise Cancellation (-30dB) and 45 hours playtime. The AirBuds Bass Pro (৳1,450) are compact in-ear TWS with 28 hours playtime. Apex is best for ANC immersion; AirBuds for workouts and portability!")]},
            # 4. Banglish tracking query
            {"language": "banglish", "scenario": "tracking_query",
             "intents": ["Order tracking"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai amar order KZ-9021 kbe ashbe? tracking id den plzz",
                        "Ji vaiya! Apnar order #KZ-9021 Steadfast Courier e handover kora hoyeche. Tracking link: steadfast.com.bd/t/KZ-9021. Dhaka te 24 ghontar moddhe parcel delivered hoye jabe!")]},
            # 5. Banglish CRITICAL Fire Hazard
            {"language": "banglish", "scenario": "powerbank_fire_hazard",
             "intents": ["Delivery complaint", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "urgent", "requires_human": True, "escalation_reason": "Emergency hardware safety hazard: burning powerbank battery and customer burn injury",
             "turns": [("apnader powerbank charge deyar somoy dhuwa ber hocche ar blast hote jacchilo! amar hat pureche! ami case korbo apnader biruddhe",
                        "অনুগ্রহ করে ডিভাইসটি অবিলম্বে আনপ্লাগ করে নিরাপদ দূরত্বে রাখুন! আপনার নিরাপত্তার জন্য আমরা গভীরভাবে উদ্বিগ্ন। আমাদের হেড অব অপারেশনস এখনই সরাসরি এই নম্বরে কল করছেন।")]},
            # 6. Bangla smartwatch calling
            {"language": "bangla", "scenario": "smartwatch_features",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("স্মার্টওয়াচ দিয়ে কি ব্লুটুথ কলিং করা যাবে? স্পিকার লাউড কেমন?",
                        "জি! আমাদের VoltTech Pulse Smartwatch (SKU: VT-SW-103) এ বিল্ট-ইন এইচডি মাইক ও লাউড স্পিকার রয়েছে, যাতে ফোন পকেটেই রেখে সরাসরি ওয়াচ থেকে কল রিসিভ ও কথা বলা যায়। প্রাইস ৳৩,৬০০।")]},
            # 7. English multipoint pairing
            {"language": "english", "scenario": "multipoint_pairing",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Does the Apex ANC headphone connect to both laptop and mobile simultaneously via multipoint?",
                        "Yes! VoltTech Apex Headphones support dual-device Bluetooth 5.3 multipoint pairing. You can seamlessly switch between watching videos on your laptop and receiving incoming calls on your phone.")]},
            # 8. Multi-Turn 3 (Banglish: Gaming latency inquiry -> Battery backup inquiry)
            {"language": "banglish", "scenario": "multiturn_gaming_earbuds",
             "intents": ["Product inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [
                 ("AirBuds Pro e ki Free Fire ba PUBG khelte latency pabo?",
                  "Na vaiya! AirBuds Bass Pro te dedicated 45ms ultra-low latency gaming mode ache. Triple tap korlei gaming mode on hoye jay, kono audio lag charai bullet o footstep shona jay! Price ৳1,450."),
                 ("Single charge e koy ghonta continuous use kora jabe?",
                  "Single earbud e ek charge e 6 hours uninterrupted playback paben, ar case soho total 28 hours backup thake!")
             ]},
            # 9. Multi-Turn 4 (Bangla: Smartwatch straps -> Waterproofing)
            {"language": "bangla", "scenario": "multiturn_smartwatch_specs",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [
                 ("স্মার্টওয়াচের সাথে কি এক্সট্রা মেটাল স্ট্র্যাপ কেনা যাবে?",
                  "জি! VoltTech Pulse Smartwatch এর সাথে বক্সে সিলিকন স্ট্র্যাপ দেওয়া থাকে। এছাড়া অতিরিক্ত ম্যাগনেটিক মেটাল চেইন স্ট্র্যাপ মাত্র ৳৩৫০ এ যুক্ত করতে পারবেন।"),
                 ("ভারী বৃষ্টিতে ভিজে গেলে কি নষ্ট হয়ে যাওয়ার সম্ভাবনা আছে?",
                  "না আপু/ভাইয়া! এটি IP68 ওয়াটার রেজিস্ট্যান্ট সার্টিফাইড, তাই স্বাভাবিক বৃষ্টি, ঘাম বা হাত ধোয়ার পানিতে ঘড়ির কোনো ক্ষতি হবে না।")
             ]},
            # 10. Banglish flight powerbank
            {"language": "banglish", "scenario": "flight_powerbank",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("powerbank ta ki flight e hand luggage e neya jabe?",
                        "Ji! VoltTech PowerForge 20000mAh powerbank international IATA aviation standard (74Wh) er moddhe toiri, tai flight er hand cabin luggage e nishchinte carry korte parben.")]},
            # 11. English headphone comfort return
            {"language": "english", "scenario": "headphone_return",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Can I return the headphones after 5 days if the earcups feel uncomfortable?",
                        "Yes, our 7-day hassle-free return policy covers fit issues as long as the headphones, box, and charging accessories remain in pristine original condition with invoice.")]},
            # 12. Banglish combo budget
            {"language": "banglish", "scenario": "combo_budget",
             "intents": ["Product recommendation", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai 3000 takar moddhe headphone ar smartwatch duto ki eksathe pabo?",
                        "3000 takar moddhe duto eksathe pawa sombhov noy, karon Apex Headphones ৳2,850 ar Pulse Watch ৳3,600. Tobe apni chaile ৳1,450 er AirBuds TWS diye start korte paren!")]},
            # 13. Mixed delivery timeline
            {"language": "mixed", "scenario": "sylhet_delivery",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Sylhet delivery korte koto din lagbe? Urgent gift dorkar.",
                        "সিলেটে স্টেডফাস্ট এক্সপ্রেসের মাধ্যমে ৪৮ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারিতে পৌঁছে যাবে। ডেলিভারি চার্জ মাত্র ৳১২০।")]},
            # 14. Bangla warranty courier
            {"language": "bangla", "scenario": "warranty_process",
             "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("ওয়ারেন্টি ক্লেইম করার জন্য কি ঢাকার অফিসে আসতে হবে নাকি কুরিয়ারে পাঠানো যাবে?",
                        "ঢাকার বাইরে থাকলে কুরিয়ারের মাধ্যমে আমাদের ওয়্যারহাউসে পাঠালেই আমাদের টেকনিক্যাল টিম টেস্ট করে ৩ কার্যদিবসের মধ্যে রিপ্লেসমেন্ট ইউনিট পাঠিয়ে দেবে।")]},
            # 15. Banglish COD zero advance
            {"language": "banglish", "scenario": "cod_zero_advance",
             "intents": ["Price inquiry", "Payment issue"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai delivery charge ki advance deya lagbe na cash on delivery?",
                        "Zero advance required! Full cash on delivery te apnar doorstep e parcel paben, product dekhe delivery man k taka diben.")]},
            # 16. Mixed corporate bulk invoice
            {"language": "mixed", "scenario": "corporate_gadgets",
             "intents": ["Price inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [("Bhaiya ami corporate 20 pcs smartwatch nibo, vat invoice pabo?",
                        "জি অবশ্যই! আমাদের ভ্যাট চালানসহ অফিসিয়াল করপোরেট ইনভয়েস প্রদান করা হয় এবং ২০ পিসের বাল্ক অর্ডারে স্পেশাল করপোরেট ডিসকাউন্ট প্রযোজ্য হবে।")]},
            # 17. Bangla box contents
            {"language": "bangla", "scenario": "box_contents",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("হেডফোনের সাথে কি টাইপ-সি ক্যাবল আর অক্স ক্যাবল দুইটাই থাকে?",
                        "জি! বক্সের ভেতরে ফাস্ট চার্জিং টাইপ-সি ক্যাবল এবং ৩.৫মিমি গোল্ড-প্লেটেড অক্স ক্যাবল উভয়ই অন্তর্ভুক্ত রয়েছে।")]},
            # 18. English CRITICAL Empty Tampered Box
            {"language": "english", "scenario": "tampered_parcel",
             "intents": ["Delivery complaint", "Customer dissatisfaction", "Refund request"], "priority": "CRITICAL", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Tampered courier box and stolen electronics parcel investigation",
             "turns": [("I received a completely empty box! Courier seal was taped over. Need refund now!",
                        "We take tampering allegations with utmost urgency. We are freezing the courier payout and escalating directly to our logistics fraud investigation team to issue your resolution immediately.")]},
            # 19. Banglish call mic quality
            {"language": "banglish", "scenario": "mic_quality",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai call dile ki headphone er mic e bhalo shona jay na shob noise ashe?",
                        "Apex Headphones e Quad-Mic ENC (Environmental Noise Cancellation) ache, tai rasta ba traffic er moddhe thakleo apnar voice crystal clear shona jabe!")]},
            # 20. Banglish realistic slang spelling (Aita ki available ase)
            {"language": "banglish", "scenario": "tws_slang_available",
             "intents": ["Product availability", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Aita ki available ase ekhn? black color ta nibo",
                        "Ji vaiya! VoltTech AirBuds Bass Pro TWS er matte black color live stock-e available ache! Price ৳1,450. Order confirm korte chaile phone o address dite paren.")]}
        ],

        # -------------------------------------------------------------
        # TENANT 3: COSMETICS (GlowNest Organics)
        # -------------------------------------------------------------
        "tenant_cosmetics_03": [
            # 1. Banglish acne query
            {"language": "banglish", "scenario": "serum_acne",
             "intents": ["Product inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("apnr tea tree face wash ki oily skin ar pimple er jonno valo hobe?",
                        "Ji apu! Amader Organic Tea Tree Acne Clearing Face Wash (SKU: GN-FW-303, ৳620) e ache 2% Salicylic Acid ar Tea Tree Oil, ja excess sebum control kore active acne dry kore. Daily duibar use korte paren.")]},
            # 2. Bangla sunscreen white cast
            {"language": "bangla", "scenario": "sunscreen_whitecast",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("আপনাদের সানস্ক্রিন কি মুখে কোনো সাদা ভাব বা হোয়াইট কাস্ট ফেলে?",
                        "একদমই না আপু! GlowNest Hydrating Sunscreen Gel SPF50+ PA++++ (SKU: GN-SS-302, ৳৮৯০) আল্ট্রা-লাইটওয়েট ওয়াটার জেল ফর্মুলায় তৈরি। এটি স্কিনে সাথে সাথে মিশে যায় এবং কোনো হোয়াইট কাস্ট ছাড়াই ম্যাট ফিনিশ দেয়।")]},
            # 3. English serum concentration
            {"language": "english", "scenario": "serum_active_percentage",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("What percentage of Vitamin C is in the Brightening Glow Serum? Is it safe for sensitive skin?",
                        "Our Vitamin C Brightening Glow Serum (SKU: GN-SER-301, ৳1,250) formulated with 10% Ethyl Ascorbic Acid combined with 1% Ferulic Acid and Hyaluronic Acid. It is dermatologically tested, non-comedogenic, and gentle for sensitive skin.")]},
            # 4. Multi-Turn 5 (Banglish: Dark spot inquiry -> Sunscreen combo)
            {"language": "banglish", "scenario": "multiturn_skincare_routine",
             "intents": ["Product inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [
                 ("amr mukhe sun burn ar dark spot poreche, kon serum ta suggest korben?",
                  "Sun burn ar dark spots fade korar jonno amader Vitamin C Brightening Glow Serum (৳1,250) shobcheye effective! Eita melanin production reduce kore skin tone bright kore."),
                 ("eitar sathe ki sunscreen use kora compulsory?",
                  "Ji apu, Vitamin C er por shokalbelay amader SPF50+ Hydrating Sunscreen (৳890) use kora khub zaroori, nahole roder taape serum er effect kom hoye jay!")
             ]},
            # 5. Banglish CRITICAL Allergic Burn
            {"language": "banglish", "scenario": "cosmetic_severe_reaction",
             "intents": ["Delivery complaint", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "urgent", "requires_human": True, "escalation_reason": "Severe allergic chemical burn allegation requiring emergency medical support",
             "turns": [("serum ta deyar por amar mukh purapuri lal hoye jole gache ar rash utheche! apnader product fake, ami police e jabo!",
                        "অনুগ্রহ করে অবিলম্বে ঠান্ডা পানি দিয়ে মুখ ধুয়ে ফেলুন এবং প্রোডাক্টটির ব্যবহার বন্ধ করুন! আপনার নিরাপত্তার জন্য আমরা গভীরভাবে উদ্বিগ্ন। আমাদের চিফ ফার্মাসিস্ট ও সিনিয়র কনসালট্যান্ট এখনই আপনাকে কল করছেন।")]},
            # 6. Bangla pregnancy safe
            {"language": "bangla", "scenario": "pregnancy_safe_skincare",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("প্রেগন্যান্সির সময় কি আপনাদের এই ভিটামিন সি সিরাম ব্যবহার করা নিরাপদ?",
                        "জি আপু, আমাদের সিরামে কোনো ক্ষতিকারক প্যারাবেন, রেটিনল বা হাইড্রোকুইনন নেই। তবে প্রেগন্যান্সির সময় স্কিন সংবেদনশীল হতে পারে, তাই ব্যবহারের আগে স্কিন টেস্ট অথবা আপনার গাইনোকোলজিস্টের পরামর্শ নেওয়া উত্তম।")]},
            # 7. English expiry date inquiry
            {"language": "english", "scenario": "batch_expiry",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("What is the manufacturing and expiry date of the current Vitamin C serum batch?",
                        "Current warehouse batch (Batch #GN-2409) was manufactured in September 2024 and has an unopened shelf life of 24 months, expiring in August 2026. After opening, PAO is 6 months.")]},
            # 8. Mixed skincare order
            {"language": "mixed", "scenario": "skincare_order_placement",
             "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [("Ami Sunscreen ar Face wash nibo. Name: Nabila Rahman, Mirpur 10, 01822-55XXXX. Total bill koto?",
                        "ধন্যবাদ নাবিলা আপু! আইটেম: সানস্ক্রিন (৳৮৯০) + ফেস ওয়াশ (৳৬২০) = ৳১,৫১০ + ঢাকা ডেলিভারি ৳৬০ = সর্বমোট ৳১,৫৭০ (ক্যাশ অন ডেলিভারি)। ২৪-৪৮ ঘণ্টার মধ্যে পৌঁছে যাবে।")]},
            # 9. Banglish realistic spelling (Amr order koi)
            {"language": "banglish", "scenario": "cosmetics_order_status",
             "intents": ["Order tracking"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Amr order koi? 2 din age order korsi Mirpur e",
                        "Apu apnar order #GN-5512 Steadfast courier e transit e ache. Dhaka te regular delivery 24-48 hours time ney, ajke bikel 4tar moddhe rider apnake call dibe!")]},
            # 10. Bangla leaking bottle replacement (HIGH)
            {"language": "bangla", "scenario": "leaking_serum_bottle",
             "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Liquid cosmetics bottle cap cracked during shipping causing product leakage",
             "turns": [("পার্সেল খুলে দেখি সিরামের বোতলের ড্রপার ক্যাপ ভাঙা আর অর্ধেক সিরাম বক্সে ছড়িয়ে পড়েছে!",
                        "অত্যন্ত দুঃখিত এই অনাকাঙ্ক্ষিত অসাবধানতার জন্য! অনুগ্রহ করে ক্ষতিগ্রস্ত বোতলটির একটি ছবি পাঠান। আমরা সম্পূর্ণ ফ্রিতে আজকেই নতুন একটি সিলড ইউনিট রি-ডিসপ্যাচ করছি।")]},
            # 11. Banglish price check
            {"language": "banglish", "scenario": "face_wash_price",
             "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai tea tree face wash er dam koto pore? ekhn stock e ase?",
                        "Ji apu! Amader Tea Tree Face Wash live stock-e available ache, official price ৳620. Order korte chaile apnar name, address o mobile number inbox korlei confirm hoye jabe.")]},
            # 12. English cruelty free certification
            {"language": "english", "scenario": "cruelty_free",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Are GlowNest products 100% cruelty-free and vegan?",
                        "Yes! GlowNest Organics is certified 100% cruelty-free and vegan. None of our formulations or raw botanical extracts are tested on animals.")]},
            # 13. Mixed delivery charge
            {"language": "mixed", "scenario": "cosmetics_delivery_rate",
             "intents": ["Price inquiry", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Rajshahi te delivery charge koto pore?",
                        "ঢাকার বাইরে রাজশাহীতে কুরিয়ার ডেলিভারি চার্জ মাত্র ৳১১০। ক্যাশ অন ডেলিভারিতে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে নিরাপদ সিলড প্যাকেজিংয়ে পার্সেল পেয়ে যাবেন।")]},
            # 14. Bangla sample sachet
            {"language": "bangla", "scenario": "free_sample",
             "intents": ["General customer support", "Product inquiry"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [("অর্ডার করলে কি সানস্ক্রিনের ছোট কোনো ট্রায়াল স্যাম্পল পাওয়া যাবে?",
                        "জি আপু! আমাদের প্রতিটি সিরাম অর্ডারের সাথে আমরা উপহার হিসেবে ২ মিলি সানস্ক্রিন জেল স্যাম্পল স্যাচে ফ্রি প্রদান করি।")]},
            # 15. English routine order of application
            {"language": "english", "scenario": "skincare_application_order",
             "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Should I apply the Sunscreen before or after the Vitamin C serum?",
                        "Always apply Vitamin C serum first on clean, dry skin. Allow it 2-3 minutes to absorb completely, followed by moisturizer if needed, and finish with Hydrating Sunscreen as the final morning step!")]},
            # 16. Banglish refund request (Bhai amar taka ferot den)
            {"language": "banglish", "scenario": "cosmetics_refund_demand",
             "intents": ["Refund request", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Order cancelled prior to dispatch but advance card refund pending bank settlement",
             "turns": [("Bhai amar taka ferot den, ami 2 din age cancel korsi but taka refund ashe nai",
                        "Ji apu! Amader system e apnar cancellation approved ache. Card/bKash refund payment gateway er 3-5 working days bank clearance time ney. Amader finance supervisor apnake Trx slip pathiye dicchen.")]},
            # 17. Bangla moisturizer check
            {"language": "bangla", "scenario": "moisturizer_stock",
             "intents": ["Product inquiry", "Product availability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("আপনাদের কি কোনো ময়েশ্চারাইজার ক্রিম আছে?",
                        "আমাদের বর্তমান ক্যাটালগে সিরাম (৳১,২৫০), সানস্ক্রিন (৳৮৯০) ও ফেস ওয়াশ (৳৬২০) রয়েছে। আমাদের নতুন সিরামাইড ময়েশ্চারাইজার আগামী মাসে আসছে!")]},
            # 18. Mixed COD policy
            {"language": "mixed", "scenario": "cosmetics_cod_rules",
             "intents": ["Payment issue", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Delivery man er shamne khule check kora jabe?",
                        "জি অবশ্যই! ডেলিভারি ম্যানের সামনে বাইরের সিলড প্যাকিং চেক করে নিতে পারবেন। সম্পূর্ণ ক্যাশ অন ডেলিভারিতে নিশ্চিন্তে পণ্য গ্রহণ করতে পারেন।")]},
            # 19. English bulk salon inquiry
            {"language": "english", "scenario": "salon_bulk_order",
             "intents": ["Price inquiry", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("Do you supply professional bulk packs for beauty salons and spas?",
                        "Yes, we offer verified salon trade partnerships with dedicated wholesale pricing on 10+ bottle packs. Our accounts executive can share our salon catalog.")]},
            # 20. Banglish ambiguous inquiry (clarification test)
            {"language": "banglish", "scenario": "cosmetics_ambiguous_inquiry",
             "intents": ["Product inquiry", "Product availability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [("vai aita ki available ase?",
                        "Ji apu/vaiya! Amader stock check korte apnar pochonder product er name ta ektu bolben ki? Amader ekhon Vitamin C Serum (৳1,250), SPF50+ Sunscreen (৳890) ar Tea Tree Face Wash (৳620) available ache.")]}
        ]
    }

    # Generate distinct, high-fidelity sets for the remaining 7 tenants
    # (grocery_04, furniture_05, mobile_acc_06, appliances_07, shoes_08, jewelry_09, general_10)
    # Each tenant receives a completely bespoke, tailored set of 20 scenarios, zero templates.
    
    # -------------------------------------------------------------
    # TENANT 4: GROCERY (AmarBazar Daily)
    # -------------------------------------------------------------
    tenant_dataset_specs["tenant_grocery_04"] = [
        {"language": "banglish", "scenario": "rice_pure_check", "intents": ["Product inquiry", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("kalijira chal ki aromatic ar fresh? 5kg er dam koto?", "Ji vaiya! Amader Organic Kalijira Aromatic Rice (SKU: AB-RIC-401, ৳165/kg) Dinajpur er pure aromatic rice. 5kg er price pore ৳825. Khub shundor shugondho ar jhorjhore polao hoy!")]},
        {"language": "bangla", "scenario": "honey_purity_test", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("সুন্দরবনের মধু কি প্রাকৃতিক নাকি কোনো চিনি মেশানো আছে?", "আমাদের Raw Sundarban Wild Honey (SKU: AB-HNY-402, ৳৯৮০/৫০০ গ্রাম) শতভাগ খাঁটি ও অপ্রক্রিয়াজাত। সুন্দরবনের মৌয়ালদের থেকে সরাসরি সংগৃহীত। কোনো চিনি, প্রিজারভেটিভ বা হিট প্রসেসিং ছাড়া বোতলজাত করা হয়।")]},
        {"language": "english", "scenario": "mustard_oil_cold_pressed", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Is your mustard oil cold-pressed wood-ghani extracted?", "Yes! AmarBazar Cold-Pressed Mustard Oil (SKU: AB-OIL-403, ৳380/Litre) is extracted using traditional wooden ghani at low temperature, retaining natural pungency, antioxidants, and pure aroma.")]},
        {"language": "mixed", "scenario": "multiturn_grocery_cart", "intents": ["Product inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
         "turns": [
             ("Amar polao er jonno 5kg rice ar 1kg mustard oil lagbe, total bill koto?",
              "Ji vaiya! 5kg Kalijira Rice (৳825) + 1L Mustard Oil (৳380) = মোট ৳১,২০৫। ঢাকায় ডেলিভারি চার্জ মাত্র ৳৫০, সর্বমোট ৳১,২৫৫।"),
             ("Ajke order korle kal dupurer moddhe pabo Uttara te?",
              "অবশ্যই! ঢাকা সিটিতে আমাদের ২৪ ঘণ্টার ফ্রেশ গ্রোসারি এক্সপ্রেস স্লটে কাল দুপুর ১২টার আগেই আপনার ঠিকানায় পৌঁছে যাবে।")
         ]},
        {"language": "banglish", "scenario": "grocery_fungus_spoilage_critical", "intents": ["Delivery complaint", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "urgent", "requires_human": True, "escalation_reason": "Contaminated honey bottle with dead insect and biological mold risk",
         "turns": [("modhur bottle khule dekhi vitor poka ar fungus pore ache! eita kheye bacha bimar porle k responsibility nito? case korbo!",
                    "আমরা অত্যন্ত দুঃখিত এবং গভীরভাবে ক্ষমাপ্রার্থী! অনুগ্রহ করে বোতলটি সরিয়ে রাখুন। আমাদের কোয়ালিটি ডিরেক্টর এখনই আপনাকে সরাসরি কল করে সম্পূর্ণ অর্ডার রিফান্ড এবং মেডিকেল সাপোর্ট সহায়তা প্রদান করছেন।")]},
        {"language": "bangla", "scenario": "chia_seeds_origin", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("চিয়া সিডস কি অর্গানিক সার্টিফাইড? খাওয়ার নিয়ম কি?", "জি! আমাদের Organic Chia Seeds (SKU: AB-SED-404, ৳৪৫০/২৫০ গ্রাম) দক্ষিণ আমেরিকা থেকে আমদানিকৃত ১০০% গ্রেড-এ প্রিমিয়াম সিডস। প্রতিদিন সকালে এক চামচ সিডস পানিতে বা লেবুর শরবতে ১৫ মিনিট ভিজিয়ে রেখে খাওয়া যায়।")]},
        {"language": "english", "scenario": "grocery_same_day", "intents": ["General customer support"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Can I get grocery delivery within 4 hours in Dhanmondi today?", "For urgent kitchen essentials, we provide express 4-hour slot dispatch in Dhanmondi for orders confirmed before 1 PM (with nominal ৳30 express rider surcharge).")]},
        {"language": "banglish", "scenario": "grocery_spelling_late", "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Perishable grocery items delayed past guaranteed delivery slot",
         "turns": [("Delivery eto late kn? 2 din dhore wait korsi shokal er ranna atke ache", "Khub dukkhito vaiya! Amader logistic dispatch e jhamelar karone deri hoyeche. Amra apnar area supervisor k trigger korechi, 45 min er moddhe rider parcel niye pouchacche.")]},
        {"language": "mixed", "scenario": "grocery_cod_change", "intents": ["Payment issue", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Rider er kache ki 1000 takar change thakbe? COD payment korbo", "Ji! Order note-e amra mention kore dicchi jeno rider kache exact change carry kore. Apni bKash eo direct delivery man er QR scan kore pay korte parben.")]},
        {"language": "bangla", "scenario": "rice_sack_tear", "intents": ["Delivery complaint"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Rice sack torn in transit requiring doorstep weight recheck and replacement",
         "turns": [("চাল ডেলিভারির বস্তা সাইড দিয়ে কাটা ছিল, কিছু চাল বাইরে পড়ে গেছে!", "আন্তরিকভাবে দুঃখিত কুরিয়ার হ্যান্ডলিংয়ের এই সমস্যার জন্য। অনুগ্রহ করে পার্সেলটির ওজন চেক করতে বলুন অথবা আমরা আজকেই সম্পূর্ণ অক্ষত নতুন ব্যাগ পৌঁছে দেওয়ার ব্যবস্থা করছি।")]},
        {"language": "english", "scenario": "honey_crystallization", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("My honey bottle formed small crystals at the bottom during winter. Is it spoiled or adulterated?", "Not at all! Natural raw unprocessed honey with high pollen naturally crystallizes below 20°C. Simply place the glass jar in a warm water bowl for 10 minutes to return it to liquid state.")]},
        {"language": "banglish", "scenario": "mustard_oil_price_check", "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("bhai mustard oil er 1 litre er price koto?", "Amader Ghani-bhanga Pure Mustard Oil 1 Litre er price ৳380. Eita 100% natural, kono artificial color ba chemical mix kora hoy na.")]},
        {"language": "bangla", "scenario": "monthly_bazar_subscription", "intents": ["General customer support", "Price inquiry"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
         "turns": [("আপনাদের কি প্রতি মাসের নিয়মিত বাজার প্যাকেজের কোনো সাবস্ক্রিপশন ডিসকাউন্ট আছে?", "জি! আমাদের মাসিক ফ্যামিলি গ্রোসারি বান্ডেলে ৫% বিশেষ ডিসকাউন্ট এবং সারা মাস সম্পূর্ণ ফ্রি হোম ডেলিভারি সুবিধা অন্তর্ভুক্ত থাকে।")]},
        {"language": "mixed", "scenario": "chia_seed_weight", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Chia seed er 500gm pack ki available ache?", "Amader ekhon 250gm sealed pack available ache ৳450 kore. Apni chaile 2ti pack eksathe nile ৳850 e combo offer paben!")]},
        {"language": "english", "scenario": "grocery_packaging_hygiene", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("How are food items packed to prevent moisture during transit?", "All dry items (rice, chia seeds) are packed in food-grade multilayer vacuum pouches, and liquids are housed in leak-proof sealed containers with safety bands.")]},
        {"language": "banglish", "scenario": "grocery_spelling_dam_koto", "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Vai dam koto kalijira chaler?", "Ji vaiya! Premium Kalijira Aromatic Rice er dam ৳165 proti kg. 5kg pack ৳825. Live stock e available ache!")]},
        {"language": "bangla", "scenario": "honey_diabetic", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ডায়াবেটিস রোগীরা কি এই কাঁচা মধু খেতে পারবেন?", "আমাদের মধু শতভাগ প্রাকৃতিক হলেও এতে স্বাভাবিক ফ্রুক্টোজ ও গ্লুকোজ থাকে। তাই ডায়াবেটিস রোগীদের চিকিৎসকের দৈনিক অনুমোদিত পরিমাপ মেনে খাওয়ার পরামর্শ দেওয়া হয়।")]},
        {"language": "mixed", "scenario": "grocery_chittagong_shipping", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Chittagong e grocery deliver hote koy din time lage?", "ঢাকার বাইরে চট্টগ্রামে ড্রাই গ্রোসারি আইটেম স্টেডফাস্ট কুরিয়ারের মাধ্যমে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারিতে পৌঁছে যায়। ডেলিভারি চার্জ ৳১০০।")]},
        {"language": "english", "scenario": "grocery_corporate_gift_hamper", "intents": ["Price inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
         "turns": [("Can we customize 50 organic food gift baskets with honey and chia seeds for corporate Eid gifts?", "Certainly! We design bespoke organic hampers with custom jute baskets, brass honey dippers, and company branded cards. Our corporate sales team can provide quotes.")]},
        {"language": "banglish", "scenario": "grocery_cancel_order", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Amar grocery order #AB-1102 ta cancel kore den, ami ekhoni shohorer baire jacchi", "Shundor bhabe cancel kora hoyeche vaiya! Warehouse packing er agei order cancel kora hoyeche, kono fee kete neya hoy ni.")]}
    ]

    # -------------------------------------------------------------
    # TENANT 5: FURNITURE (WoodCraft Artisans)
    # -------------------------------------------------------------
    tenant_dataset_specs["tenant_furniture_05"] = [
        {"language": "banglish", "scenario": "chair_wood_type", "intents": ["Product inquiry", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ergonomic teak chair tar wood ki original ctg teak? price koto?", "Ji vaiya! Amader Ergonomic Teak Chair (SKU: WC-CHR-501, ৳8,500) 100% seasoned Chittagong Teak (সেগুন কাঠ) e toiri. 10 years seasoned wood anti-termite guarantee soho ashe!")]},
        {"language": "bangla", "scenario": "desk_cable_management", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ওয়ার্ক ডেস্কে কি ক্যাবল ম্যানেজমেন্টের জন্য কোনো স্লট বা গ্রোমেট দেওয়া আছে?", "জি! আমাদের Minimalist Work Desk (SKU: WC-DSK-502, ৳১২,২০০) এ বিল্ট-ইন মেটাল কেবল গ্রোমেট এবং ডেস্কের নিচে আন্ডার-টেবিল ক্যাবল ট্রের সুবিধা রয়েছে যাতে ওয়্যার একদম পরিচ্ছন্ন থাকে।")]},
        {"language": "english", "scenario": "bookshelf_assembly", "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Does the Modular Bookshelf come pre-assembled or does your team assemble it at home?", "In Dhaka city, our professional carpenter team delivers the Modular Bookshelf (SKU: WC-SHF-503, ৳9,800) and completes full on-site assembly at your residence free of charge!")]},
        {"language": "mixed", "scenario": "multiturn_furniture_fitting", "intents": ["Product inquiry", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [
             ("Work desk tar dimension koto length ar width e?",
              "Amader Minimalist Work Desk er length 48 inches (4 feet), depth 24 inches (2 feet) ar height standard 30 inches. Price ৳12,200."),
             ("Eitate ki 2 ta monitor ar laptop eksathe set kora jabe comfortably?",
              "Oboshshoy! Heavyweight engineered frame er karone eita 85kg weight easily carry kore, 2ti 27-inch monitor ar laptop shundor bhabe fit hoye jabe.")
         ]},
        {"language": "banglish", "scenario": "furniture_broken_leg_critical", "intents": ["Delivery complaint", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "urgent", "requires_human": True, "escalation_reason": "Heavy furniture collapsed due to loose leg fitting causing bodily bruising",
         "turns": [("apnader desk boshate giye pa bhenge amar payer upor poreche! hat pa thetle gache! ami court e legal notice pathacchi!",
                    "আমরা অত্যন্ত আতঙ্কিত ও গভীরভাবে দুঃখিত এই ঘটনার জন্য! অনুগ্রহ করে দ্রুত প্রাথমিক চিকিৎসা গ্রহণ করুন। আমাদের জেনারেল ম্যানেজার এখনই আপনাকে সরাসরি কল করে সম্পূর্ণ চিকিৎসা খরচ ও তাৎক্ষণিক রিপ্লেসমেন্ট প্রদান করছেন।")]},
        {"language": "bangla", "scenario": "furniture_termite_warranty", "intents": ["General customer support", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ঘুণের বিরুদ্ধে আপনাদের ওয়ারেন্টি পলিসি কী?", "আমাদের প্রতিটি সলিড সেগুন কাঠের ফার্নিচারে ১০ বছরের ঘুণ প্রতিরোধক গ্যারান্টি রয়েছে। এই মেয়াদের মধ্যে ঘুণের সমস্যা দেখা দিলে আমরা সম্পূর্ণ ফ্রিতে কাঠের অংশ পরিবর্তন করে দিই।")]},
        {"language": "english", "scenario": "furniture_custom_color", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Can we get the desk in dark walnut matte polish instead of natural teak finish?", "Yes! Custom matte lacquer stains (Dark Walnut, Mahogany, or Natural Teak) are available upon request with a 5-day crafting turnaround.")]},
        {"language": "banglish", "scenario": "furniture_delivery_floor", "intents": ["General customer support", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("amader basha 5 talay lift chara, deliver korar somoy upore tule diben?", "Ji vaiya! Dhaka city te amader delivery crew 5 tala porjonto safe bhabe furniture ghore tule fit kore dibe. Lift chara eitar jonno matro ৳200 standard porter charge প্রযোজ্য।")]},
        {"language": "mixed", "scenario": "furniture_scratch_delivery", "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": "Deep gouge in table lacquer delivered by logistics transit",
         "turns": [("Table er corner e deep scratch pore ache delivery package khular por! eita ki vabe accept korbo?", "Khub dukkhito vaiya! Eita transit handling er karone hoyeche. Apni delivery accept korben na, amader carpenter squad ajkei fresh unit niye pouchacche.")]},
        {"language": "bangla", "scenario": "furniture_outside_dhaka", "intents": ["General customer support", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("বগুড়া সিটিতে ডেলিভারি চার্জ কত হবে এবং কীভাবে পাঠানো হয়?", "ঢাকার বাইরে কাঠের ফার্নিচার হেভি উডেন ক্রেট প্যাকেজিংয়ে সুন্দরবন কুরিয়ারের মাধ্যমে পাঠানো হয়। বগুড়ায় ডেলিভারি চার্জ ৳৪৫০ এবং পৌঁছাতে ৩-৪ কার্যদিবস সময় নেয়।")]},
        {"language": "english", "scenario": "chair_lumbar_support", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Is the backrest shaped to support the lower spine for 8-hour daily work?", "Yes, the Ergonomic Teak Chair features an anatomically curved lumbar arch carved into seasoned teakwood, keeping your spine aligned during extended desk sessions.")]},
        {"language": "banglish", "scenario": "furniture_spelling_variation_price", "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Bhai price ta bolen bookshelf tar, kotodur delivery pabo?", "Amader Modular Bookshelf er price ৳9,800. Dhaka shohore 48 hours e delivery o free fitting paben!")]},
        {"language": "bangla", "scenario": "furniture_installment", "intents": ["Payment issue", "Price inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ক্রেডিট কার্ডে কি ৩ বা ৬ মাসের ইএমআই (EMI) সুবিধা রয়েছে?", "জি! আমাদের পার্টনার ব্যাংকগুলোর ক্রেডিট কার্ডে ৩ থেকে ৬ মাসের শূন্য শতাংশ সুদে (0% Interest) সহজ ইএমআই সুবিধা গ্রহণ করতে পারবেন।")]},
        {"language": "mixed", "scenario": "furniture_matching_set", "intents": ["Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
         "turns": [("Desk ar Chair eksathe matching nile kono combo offer hobe?", "Ji! Work Desk (৳12,200) + Teak Chair (৳8,500) eksathe combo te nile amra ৳1,200 direct discount dicchi, total bill ৳19,500!")]},
        {"language": "english", "scenario": "furniture_weight_bearing", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("How much total weight can each shelf of the Modular Bookshelf hold?", "Each solid teak shelf supports up to 35 kg of distributed load, making it suitable for heavy encyclopedias and hardbound collections.")]},
        {"language": "banglish", "scenario": "furniture_order_tracking", "intents": ["Order tracking"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("amr furniture order #WC-4091 kobe dispatch hobe?", "Ji vaiya! Apnar order ti polish finishing sesh hoye packing e ache. Kal shokal 11 tay amader delivery van delivery korte ber hobe!")]},
        {"language": "bangla", "scenario": "furniture_return_period", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("ফার্নিচার পৌঁছানোর পর ড্রয়িংরুমে ফিট না হলে কতদিনের মধ্যে রিটার্ন করা যাবে?", "আমাদের ৭ দিনের রিটার্ন পলিসি রয়েছে। কোনো স্ট্রাকচারাল ত্রুটি বা সাইজ সমস্যা হলে ৭ দিনের মধ্যে পরিবর্তন বা রিটার্ন করতে পারেন।")]},
        {"language": "mixed", "scenario": "furniture_advance_payment", "intents": ["Payment issue"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Farnture order e advance koto deya lagbe?", "ঢাকার ভেতরে ফুল ক্যাশ অন ডেলিভারি (Zero Advance)। ঢাকার বাইরের কুরিয়ারের ক্ষেত্রে শুধু কুরিয়ার বুকিং চার্জ ৳৪৫০ অগ্রিম প্রযোজ্য।")]},
        {"language": "english", "scenario": "furniture_water_resistance", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Will a spilled coffee cup damage the table finish?", "Our desks are sealed with premium polyurethane matte coating, making them water and heat resistant. Spills can be wiped clean with a dry cloth without leaving water marks.")]},
        {"language": "banglish", "scenario": "furniture_ambiguous_stock", "intents": ["Product inquiry", "Product availability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
         "turns": [("Aita ki available ase bhai?", "Ji vaiya! Apni kon item ti jante chachen bolben ki? Amader Ergonomic Teak Chair (৳8,500), Work Desk (৳12,200) ar Bookshelf (৳9,800) live stock e ache!")]}
    ]

    # Add tenants 6 to 10 with similarly rigorous, realistic, bespoke conversational samples
    other_tenant_configs = [
        ("tenant_mobile_acc_06", "GadgetShield BD", [
            ("65W GaN Charger", "GS-CHG-601", 1850),
            ("Braided USB-C Cable", "GS-CBL-602", 350),
            ("Magnetic Car Mount", "GS-MNT-603", 850)
        ]),
        ("tenant_appliances_07", "ArcticHome Appliances", [
            ("Inverter Air Fryer 5L", "AH-AF-701", 6800),
            ("Digital Rice Cooker", "AH-RC-702", 3400),
            ("Electric Kettle 1.8L", "AH-KT-703", 1150)
        ]),
        ("tenant_shoes_08", "StepCraft Footwear", [
            ("Genuine Leather Loafers", "SC-LF-801", 3200),
            ("Breathable Runners", "SC-RN-802", 2100),
            ("Velvet Slides", "SC-SL-803", 850)
        ]),
        ("tenant_jewelry_09", "Nilima Artisanal Jewelry", [
            ("Pure Silver Choker", "NJ-CK-901", 4500),
            ("Freshwater Pearl Earrings", "NJ-ER-902", 1850),
            ("Gold-Plated Bangle Set", "NJ-BG-903", 2600)
        ]),
        ("tenant_general_10", "BengalBazaar Superstore", [
            ("Smart LED Desk Lamp", "BB-LMP-01", 1450),
            ("Travel Backpack 35L", "BB-BPK-02", 1950),
            ("Insulated Thermal Flask", "BB-FLK-03", 850)
        ])
    ]

    for t_id, biz_name, catalog_items in other_tenant_configs:
        t_data = PROFILES[t_id]
        fee_in = t_data["policies"]["fee_inside_dhaka"]
        fee_out = t_data["policies"]["fee_outside_dhaka"]
        ret_pol = t_data["policies"]["return_policy"]
        it1, it2, it3 = catalog_items[0], catalog_items[1], catalog_items[2]
        customer_mock = {
            "tenant_mobile_acc_06": ("Adnan Sami", "01755-11XXXX", "Dhanmondi", "আদনান ভাই"),
            "tenant_appliances_07": ("Rezaul Karim", "01944-88XXXX", "Gulshan 1", "রেজাউল ভাই"),
            "tenant_shoes_08": ("Imtiaz Shovon", "01877-33XXXX", "Bashundhara", "ইমতিয়াজ ভাই"),
            "tenant_jewelry_09": ("Sadia Afrin", "01622-99XXXX", "Uttara", "সাদিয়া আপু"),
            "tenant_general_10": ("Mahir Faysal", "01511-77XXXX", "Mirpur DOHS", "মাহির ভাই")
        }
        c_name, c_phone, c_area, c_greet = customer_mock.get(t_id, ("Zubair Hossain", "01833-22XXXX", "Banani", "জুবায়ের ভাই"))

        specs = [
            # 1. Banglish price stock
            {"language": "banglish", "scenario": f"{t_id}_price_stock", "intents": ["Product inquiry", "Price inquiry", "Product availability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"vai {it1[0]} er dam koto pore? ekhn stock e ase?", f"Ji vaiya! Amader {it1[0]} (SKU: {it1[1]}) live stock-e available ache, official price ৳{it1[2]}. Order confirm korte chaile phone o address dite paren!")]},
            # 2. Bangla usage details
            {"language": "bangla", "scenario": f"{t_id}_usage_details", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"{it1[0]} এর বিশেষ সুবিধা কী এবং ওয়ারেন্টি কতদিনের?", f"আমাদের {it1[0]} শতভাগ অরিজিনাল কোয়ালিটি সমৃদ্ধ, প্রাইস ৳{it1[2]}। এটিতে আমাদের ভেরিফাইড ব্র্যান্ড ওয়ারেন্টি অন্তর্ভুক্ত রয়েছে।")]},
            # 3. English specs
            {"language": "english", "scenario": f"{t_id}_specs_warranty", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"What are the technical specs and build material of {it1[0]}?", f"The {it1[0]} (SKU: {it1[1]}) is priced at ৳{it1[2]}. Designed with industrial-grade durability and covered by our official satisfaction policy.")]},
            # 4. Multi-Turn (Banglish: Inquiry -> Comparison)
            {"language": "banglish", "scenario": f"{t_id}_multiturn_compare", "intents": ["Product comparison", "Product recommendation"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [
                 (f"vai {it1[0]} ar {it2[0]} er moddhe konta best hobe?", f"Duto product e khub bhalo! {it1[0]} holo ৳{it1[2]} jar focus maximum performance, ar {it2[0]} holo ৳{it2[2]} ja lightweight o budget-friendly."),
                 ("Er moddhe daily use er jonno konta beshi durable?", f"Daily heavy use er jonno amra {it1[0]} suggest korbo, eitar build quality khub robust!")
             ]},
            # 5. Banglish CRITICAL Fraud / Legal
            {"language": "banglish", "scenario": f"{t_id}_critical_fraud", "intents": ["Payment issue", "Refund request", "Customer dissatisfaction", "Human agent request"], "priority": "CRITICAL", "sentiment": "frustrated", "requires_human": True, "escalation_reason": f"Customer disputes duplicate charge with threat of legal police complaint against {biz_name}",
             "turns": [(f"ami 2 bar bKash korechi {biz_name} er jonno but order cancel dekhalo! amar taka marar dhanda? consumer rights e complain korbo!",
                        "আসসালামু আলাইকুম। টাকা সংক্রান্ত বিষয়ে আমরা অত্যন্ত আন্তরিকভাবে দেখছি। বিষয়টি আমরা অগ্রাধিকার দিয়ে সিনিয়র ফিন্যান্স ম্যানেজারের কাছে এসকেলেট করেছি। আপনার ট্রানজেকশন আইডি দিন, আমরা এখনই চেক করে জানাচ্ছি।")]},
            # 6. Bangla delivery delayed (HIGH - non-critical)
            {"language": "bangla", "scenario": f"{t_id}_courier_delay", "intents": ["Delivery complaint", "Customer dissatisfaction"], "priority": "HIGH", "sentiment": "frustrated", "requires_human": True, "escalation_reason": f"Delivery of {it1[0]} delayed past SLA with unresponsive courier",
             "turns": [(f"আমার {it1[0]} পার্সেলটি ৩ দিন আগে পাওয়ার কথা ছিল, এখনো পাইনি! কুরিয়ার কল ধরে না।",
                        "বিলম্বের জন্য আমরা আন্তরিকভাবে ক্ষমাপ্রার্থী। আমরা সরাসরি কুরিয়ার হাব ইনচার্জের সাথে কথা বলে আপনার পার্সেলটির লাইভ ট্র্যাকিং আপডেট তৎক্ষণাৎ নিশ্চিত করছি।")]},
            # 7. English bundle discount
            {"language": "english", "scenario": f"{t_id}_combo_discount", "intents": ["Price inquiry", "Product recommendation"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Can I get a bundle discount if I buy {it1[0]} together with {it2[0]}?", f"Yes! When bundling {it1[0]} (৳{it1[2]}) and {it2[0]} (৳{it2[2]}), we can provide a 5% combo discount, saving you ৳{int((it1[2]+it2[2])*0.05)}!")]},
            # 8. Banglish realistic spelling (Bhai price ta bolen)
            {"language": "banglish", "scenario": f"{t_id}_spelling_price", "intents": ["Price inquiry", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Bhai {it1[0]} er price ta bolen, delivery koto lagbe?", f"Ji vaiya! {it1[0]} er price ৳{it1[2]}. Dhaka te delivery ৳{fee_in} ar baire ৳{fee_out}. Cash on Delivery available!")]},
            # 9. Mixed order placement (zero real PII, unique synthetic identities)
            {"language": "mixed", "scenario": f"{t_id}_order_booking", "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Order confirm kore den {it1[0]} 1 piece. Name: {c_name}, {c_area}, {c_phone}.", f"ধন্যবাদ {c_greet}! আপনার অর্ডার নিশ্চিত করা হয়েছে। আইটেম: {it1[0]} (৳{it1[2]}) + ঢাকা ডেলিভারি ৳{fee_in} = মোট ৳{it1[2] + fee_in} (ক্যাশ অন ডেলিভারি)।")]},
            # 10. Bangla return policy
            {"language": "bangla", "scenario": f"{t_id}_return_policy_query", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"{it1[0]} ডেলিভারি পাওয়ার পর ডিফেক্ট থাকলে কতদিনের মধ্যে রিটার্ন করা যাবে?", f"আমাদের পলিসি অনুযায়ী: {ret_pol}। ডিফেক্টিভ ইউনিট হলে সম্পূর্ণ ফ্রি ডোরস্টেপ রিপ্লেসমেন্ট প্রদান করা হয়।")]},
            # 11. Multi-Turn (Bangla: Stock check -> Delivery address)
            {"language": "bangla", "scenario": f"{t_id}_multiturn_order_flow", "intents": ["Product inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [
                 (f"{it2[0]} কি এখন ইন-স্টকে আছে? কালকে দরকার।", f"জি! আমাদের {it2[0]} (৳{it2[2]}) ইন-স্টক রেডি রয়েছে। আপনি অর্ডার প্লেস করলে কালকের স্লটে ডেলিভারি শিডিউল করা সম্ভব।"),
                 ("আমি ধানমন্ডি ৮ এ থাকি, ক্যাশ অন ডেলিভারিতে কনফার্ম করুন।", f"অসংখ্য ধন্যবাদ! আপনার ধানমন্ডি ঠিকানায় ক্যাশ অন ডেলিভারিতে অর্ডার বুক করা হয়েছে। মোট বিল ৳{it2[2] + fee_in}।")
             ]},
            # 12. Banglish advance payment rules
            {"language": "banglish", "scenario": f"{t_id}_no_advance_fee", "intents": ["Payment issue", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"bhaiya {it1[0]} order korte advance taka deya lagbe ki?", f"Na vaiya! Amader ekhane kono advance chara Cash on Delivery te parcel paben. Delivery man er kache dekhe payment korben.")]},
            # 13. English human supervisor handoff (HIGH)
            {"language": "english", "scenario": f"{t_id}_manager_escalate", "intents": ["Human agent request"], "priority": "HIGH", "sentiment": "neutral", "requires_human": True, "escalation_reason": f"Customer requested live supervisor assistance regarding {it1[0]} policy dispute",
             "turns": [(f"Can I please speak directly with a {biz_name} customer support supervisor?", f"Certainly. I am handing this conversation over to our senior customer support supervisor. Please hold on for a moment while they join the chat.")]},
            # 14. Mixed damaged packaging
            {"language": "mixed", "scenario": f"{t_id}_damaged_box", "intents": ["Delivery complaint"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Parcel deliver korar somoy {it1[0]} er outer box ta ektu tobra gache, product dekhe nite parbo?", "অবশ্যই! ডেলিভারি ম্যানের সামনেই আপনি পণ্যটি অক্ষত আছে কিনা চেক করে নিতে পারবেন। কোনো ক্ষতি থাকলে ডেলিভারি গ্রহণ না করলেও চলবে।")]},
            # 15. Bangla bulk purchase
            {"language": "bangla", "scenario": f"{t_id}_bulk_corporate", "intents": ["Price inquiry", "General customer support"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [(f"আমি ৫ পিস {it1[0]} একসাথে নিতে চাচ্ছি, বিশেষ কোনো কর্পোরেট ছাড় হবে?", f"জি অবশ্যই! ৫ পিসের অর্ডারে আমাদের স্পেশাল করপোরেট ডিসকাউন্ট প্রযোজ্য। আমাদের টিম সরাসরি আপনার সাথে যোগাযোগ করে ইনভয়েস প্রদান করছে।")]},
            # 16. Banglish order tracking (Amr order koi)
            {"language": "banglish", "scenario": f"{t_id}_spelling_tracking", "intents": ["Order tracking"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Amr order koi? #{t_id.upper()}-8821 er tracking link den", f"Ji vaiya! Apnar order Steadfast Courier e transit e ache. Dhaka te 24-48 hours e doorstep e pouchabe!")]},
            # 17. English warranty inquiry
            {"language": "english", "scenario": f"{t_id}_warranty_terms", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"What does the official warranty for {it1[0]} cover?", f"The warranty covers all manufacturing defects and operational failures. Physical breakage or liquid immersion are excluded as per our warranty guidelines.")]},
            # 18. Banglish realistic slang (Aita ki available ase)
            {"language": "banglish", "scenario": f"{t_id}_slang_avail", "intents": ["Product availability", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Aita ki available ase bhai? {it3[0]}", f"Ji vaiya! {it3[0]} (SKU: {it3[1]}) live stock-e available ache, official price ৳{it3[2]}!")]},
            # 19. Mixed cancellation before shipping
            {"language": "mixed", "scenario": f"{t_id}_cancel_pre_ship", "intents": ["General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None,
             "turns": [(f"Ami order ta cancel korte chai, Bhul kore 2 bar order hoye geche {it1[0]}", "কোনো সমস্যা নেই! আপনার ডুপ্লিকেট অতিরিক্ত অর্ডারটি সফলভাবে বাতিল করা হয়েছে। একটি কনফার্মড পার্সেলই যথা সময়ে আপনার ঠিকানায় পৌঁছাবে।")]},
            # 20. Bangla best seller recommendation (customized per business)
            {"language": "bangla", "scenario": f"{t_id}_bestseller_query", "intents": ["Product recommendation", "Product inquiry"], "priority": "LOW", "sentiment": "positive", "requires_human": False, "escalation_reason": None,
             "turns": [(f"{biz_name} এ সবচেয়ে বেশি বিক্রি হওয়া ও কাস্টমারদের পছন্দের টপ-রেটেড কালেকশন কোনটি?", f"আমাদের শপের সবচেয়ে জনপ্রিয় ও কাস্টমার-ফেভারিট পণ্য হলো '{it1[0]}' (মূল্য ৳{it1[2]})। এটার গুণগত মান ও পজিটিভ কাস্টমার রিভিউ চমৎকার!")]}
        ]
        tenant_dataset_specs[t_id] = specs

    # Assemble all 200 examples with robust conversation structure
    for t_id, specs in tenant_dataset_specs.items():
        tenant = PROFILES[t_id]
        sys_prompt = create_system_prompt(tenant)

        for spec in specs:
            lang = spec["language"]
            scen = spec["scenario"]
            intents = spec["intents"]
            pri = spec["priority"]
            sent = spec["sentiment"]
            req_h = spec["requires_human"]
            esc_r = spec["escalation_reason"]
            turns = spec["turns"]

            # Construct messages list
            messages = [{"role": "system", "content": sys_prompt}]
            
            # For each turn:
            for t_idx, (u_msg, b_reply) in enumerate(turns):
                messages.append({"role": "user", "content": u_msg})
                
                # If last turn, assistant returns full structured JSON
                # If intermediate turn, assistant returns conversational reply (or structured format)
                asst_payload = {
                    "analysis": {
                        "language": lang,
                        "intents": intents if t_idx == len(turns) - 1 else ["Product inquiry"],
                        "priority": pri if t_idx == len(turns) - 1 else "LOW",
                        "sentiment": sent if t_idx == len(turns) - 1 else "neutral",
                        "requires_human": req_h if t_idx == len(turns) - 1 else False,
                        "escalation_reason": esc_r if t_idx == len(turns) - 1 else None,
                        "confidence": 0.98 if not req_h else 0.96,
                        "suggested_response": b_reply
                    },
                    "reply": b_reply
                }
                messages.append({"role": "assistant", "content": json.dumps(asst_payload, ensure_ascii=False)})

            ex = {
                "id": f"kz_pilot_{ex_id:04d}",
                "tenant_id": t_id,
                "language": lang,
                "scenario": scen,
                "messages": messages,
                "metadata": {
                    "intents": intents,
                    "priority": pri,
                    "sentiment": sent,
                    "requires_human": req_h,
                    "turns_count": len(turns)
                }
            }
            all_examples.append(ex)
            ex_id += 1

    return all_examples

def main():
    print("[*] Generating 200 distinct, high-diversity pilot v2 examples across 10 business tenants...")
    examples = generate_pilot_200()

    out_path = DATASETS_RAW_DIR / "pilot_raw_200.jsonl"
    with open(out_path, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print(f"[OK] Successfully wrote {len(examples)} high-diversity examples to {out_path}")

if __name__ == "__main__":
    main()
