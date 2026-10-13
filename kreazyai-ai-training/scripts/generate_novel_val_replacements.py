#!/usr/bin/env python3
"""
KreazyAI Pilot Validation Replacement Engine
Replaces the 52 template-overlapping validation records with genuinely novel,
grounded customer scenarios across all 10 tenants.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
VAL_FILE = BASE_DIR / "training" / "pilot_validation.jsonl"
TRAIN_FILE = BASE_DIR / "training" / "pilot_train.jsonl"

def clean_prompt(text):
    t = re.sub(r'\(tenant_[a-z0-9_]+(?:\s+ref:\d+)?\)', '', text, flags=re.IGNORECASE)
    t = re.sub(r'\(ref:\d+\)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'[^\w\s\u0980-\u09FF]', ' ', t)
    return ' '.join(t.lower().split())

# 52 Replacement records mapping by target ID
REPLACEMENTS = {
    # -------------------------------------------------------------
    # Tenant 1: tenant_shoes_08 (StrideCraft Footwear) - 9 records
    # -------------------------------------------------------------
    "kz_b4_07863": {
        "scenario": "v_novel_shoes_carbon_plate",
        "language": "mixed",
        "metadata": {"priority": "MEDIUM", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "AeroFlex Carbon Running Shoes e ki carbon fiber plate ase naki nylon plate? Marathon training er jonno pace maintenance e kemon support dibe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Technical specification"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের StrideCraft AeroFlex Carbon Running Shoes (৳2850) এ full-length responsive carbon composite plate এবং high-rebound cushioning foam ব্যবহার করা হয়েছে, যা long-distance marathon training এ steady pace এবং energy return নিশ্চিত করে। স্টকে রানিং সাইজ পাওয়া যাচ্ছে।"},
                "reply": "আমাদের StrideCraft AeroFlex Carbon Running Shoes (৳2850) এ full-length responsive carbon composite plate এবং high-rebound cushioning foam ব্যবহার করা হয়েছে, যা long-distance marathon training এ steady pace এবং energy return নিশ্চিত করে। স্টকে রানিং সাইজ পাওয়া যাচ্ছে।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07920": {
        "scenario": "v_novel_shoes_loafer_care",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Leather Penny Loafers er sathe ki matching shoe polish ba leather conditioner use kora dorkar?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product care", "General customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Handcrafted Full-Grain Genuine Leather Penny Loafers (৳3800) এর natural shine ধরে রাখতে neutral wax polish বা natural leather balm ব্যবহার করা ভালো। ক্ষতিকর কেমিক্যালযুক্ত লিকুইড পলিশ এড়িয়ে চললে চামড়ার breathability ঠিক থাকে।"},
                "reply": "আমাদের Handcrafted Full-Grain Genuine Leather Penny Loafers (৳3800) এর natural shine ধরে রাখতে neutral wax polish বা natural leather balm ব্যবহার করা ভালো। ক্ষতিকর কেমিক্যালযুক্ত লিকুইড পলিশ এড়িয়ে চললে চামড়ার breathability ঠিক থাকে।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "R eita ki formal corporate pant er sathe suit korbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Style advice"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "অবশ্যই! Penny Loafer এর ক্লাসিক টাইমলেস ডিজাইনের কারণে এটি formal trousers, chinos এবং business-casual কর্পোরেট ড্রেসের সাথে চমৎকার মানিয়ে যায়।"},
                "reply": "অবশ্যই! Penny Loafer এর ক্লাসিক টাইমলেস ডিজাইনের কারণে এটি formal trousers, chinos এবং business-casual কর্পোরেট ড্রেসের সাথে চমৎকার মানিয়ে যায়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05969": {
        "scenario": "v_novel_shoes_carpet_policy",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "If I try on the Penny Loafers indoors on a soft carpet to check sizing, will it affect the 7-day exchange policy?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Policy inquiry", "Return and exchange"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Trying shoes indoors on a clean carpet is completely fine! Our store policy allows a 7-day exchange as long as the soles have no outdoor pavement wear marks and tags remain intact."},
                "reply": "Trying shoes indoors on a clean carpet is completely fine! Our store policy allows a 7-day exchange as long as the soles have no outdoor pavement wear marks and tags remain intact."
            }, ensure_ascii=False)},
            {"role": "user", "content": "Great. What is the delivery fee to Dhanmondi in Dhaka?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Shipping fee inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Standard delivery inside Dhaka (including Dhanmondi) is ৳70, and parcels arrive within 24 to 48 hours."},
                "reply": "Standard delivery inside Dhaka (including Dhanmondi) is ৳70, and parcels arrive within 24 to 48 hours."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07850": {
        "scenario": "v_novel_shoes_loafer_sizing",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Ami regular size 42 pori sneaker e, StrideCraft Leather Penny Loafers e ki same 42 nite hobe naki ek size kom?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Sizing advice", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Penny Loafers true-to-size স্ট্যান্ডার্ড ড্রেস শু প্যাটার্নে তৈরি। স্নিকার্সে ৪২ পরলে লোফারেও সাইজ ৪২ আরামদায়ক হবে। ডেলিভারির পর সাইজে কোনো সমস্যা হলে ৭ দিনের মধ্যে ইনডোর ট্রায়াল অবস্থায় এক্সচেঞ্জ সুবিধা পাবেন।"},
                "reply": "আমাদের Penny Loafers true-to-size স্ট্যান্ডার্ড ড্রেস শু প্যাটার্নে তৈরি। স্নিকার্সে ৪২ পরলে লোফারেও সাইজ ৪২ আরামদায়ক হবে। ডেলিভারির পর সাইজে কোনো সমস্যা হলে ৭ দিনের মধ্যে ইনডোর ট্রায়াল অবস্থায় এক্সচেঞ্জ সুবিধা পাবেন।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Dhakar baire Khulna te delivery charge koto pore?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Delivery charge inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ঢাকার বাইরে খুলনায় ডেলিভারি চার্জ ৳130 এবং পৌঁছাতে সময় লাগবে 48 to 72 hours।"},
                "reply": "ঢাকার বাইরে খুলনায় ডেলিভারি চার্জ ৳130 এবং পৌঁছাতে সময় লাগবে 48 to 72 hours।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05992": {
        "scenario": "v_novel_shoes_outsole_tarmac",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Are the StrideCraft AeroFlex Carbon Running Shoes suitable for outdoor road running or strictly treadmill workouts?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Product inquiry", "Technical specification"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The AeroFlex Carbon Running Shoes (৳2850) feature high-abrasion rubber traction pods on the outsole, making them fully durable for outdoor tarmac running as well as indoor treadmill sessions."},
                "reply": "The AeroFlex Carbon Running Shoes (৳2850) feature high-abrasion rubber traction pods on the outsole, making them fully durable for outdoor tarmac running as well as indoor treadmill sessions."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07852": {
        "scenario": "v_novel_shoes_insole_cushion",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Handcrafted Penny Loafers er inner sole ki cushioned naki hard leather base?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Material inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Penny Loafers (৳3800) এর ভেতরের সোলে high-density padded latex footbed ও নরম চামড়ার লাইনিং ব্যবহার করা হয়েছে, যা দীর্ঘ সময় হাঁটায় পায়ের পাতায় চমৎকার আরামদায়ক সাপোর্ট দেয়।"},
                "reply": "আমাদের Penny Loafers (৳3800) এর ভেতরের সোলে high-density padded latex footbed ও নরম চামড়ার লাইনিং ব্যবহার করা হয়েছে, যা দীর্ঘ সময় হাঁটায় পায়ের পাতায় চমৎকার আরামদায়ক সাপোর্ট দেয়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_01929": {
        "scenario": "v_novel_shoes_breathable_mesh",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "vaiya AeroFlex running shoes er upper mesh part ta ki breathable? gorom e pa beshi sweat hoy amr."},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ji vaiya! AeroFlex Carbon Running Shoes (৳2850) e engineered jacquard breathable mesh bebohar kora hoyeche, ja running er shomoy maximum airflow nishchit kore ebong pa thanda o dry rakhe."},
                "reply": "Ji vaiya! AeroFlex Carbon Running Shoes (৳2850) e engineered jacquard breathable mesh bebohar kora hoyeche, ja running er shomoy maximum airflow nishchit kore ebong pa thanda o dry rakhe."
            }, ensure_ascii=False)},
            {"role": "user", "content": "Delivery time koto din lage Uttara te?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Delivery time inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Dhakar bhetore Uttara te amader delivery time 24 theke 48 hours, delivery charge ৳70."},
                "reply": "Dhakar bhetore Uttara te amader delivery time 24 theke 48 hours, delivery charge ৳70."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_03851": {
        "scenario": "v_novel_shoes_mud_clean",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "বৃষ্টির দিনে কাদায় লাগলে AeroFlex জুতো কীভাবে পরিষ্কার করা নিরাপদ হবে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Product care", "Maintenance inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "কাদা লাগলে প্রথমে শুকিয়ে নরম ব্রাশ দিয়ে শুকনো মাটি ঝেড়ে ফেলুন। এরপর হালকা সাবান পানিতে নরম কাপড় ভিজিয়ে ওপরের মেশ পরিষ্কার করুন। কার্বন প্লেটের স্থায়িত্ব বজায় রাখতে সরাসরি ওয়াশিং মেশিনে ধোয়া বা কড়া রোদে শুকানো থেকে বিরত থাকুন।"},
                "reply": "কাদা লাগলে প্রথমে শুকিয়ে নরম ব্রাশ দিয়ে শুকনো মাটি ঝেড়ে ফেলুন। এরপর হালকা সাবান পানিতে নরম কাপড় ভিজিয়ে ওপরের মেশ পরিষ্কার করুন। কার্বন প্লেটের স্থায়িত্ব বজায় রাখতে সরাসরি ওয়াশিং মেশিনে ধোয়া বা কড়া রোদে শুকানো থেকে বিরত থাকুন।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_01893": {
        "scenario": "v_novel_shoes_sole_stitching",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_shoes_08", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for StrideCraft Footwear (Footwear & Leather Goods). Brand tone: energetic. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Penny Loafers er outsole ki stitched naki just glued? Longevity kemon hobe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Technical specification", "Product durability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Handcrafted Full-Grain Genuine Leather Penny Loafers (৳3800) er sole reinforced perimeter stitching ebong industrial adhesive er combination e toiri, ja daily corporate use e dirghosthayi longevity nishchit kore."},
                "reply": "Handcrafted Full-Grain Genuine Leather Penny Loafers (৳3800) er sole reinforced perimeter stitching ebong industrial adhesive er combination e toiri, ja daily corporate use e dirghosthayi longevity nishchit kore."
            }, ensure_ascii=False)}
        ]
    },

    # -----------------------------------------------------------------
    # Tenant 2: tenant_appliances_07 (ElectroHome Appliances) - 8 records
    # -------------------------------------------------------------
    "kz_b4_07240": {
        "scenario": "v_novel_appliances_airfryer_wattage",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Digital Touchscreen Air Fryer (6.5L) er power consumption koto watt? Daily 30 min use korle bill kemon ashte pare?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Technical specification", "Power consumption"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের 6.5L XXL Air Fryer (৳6800) এর রেটেড পাওয়ার ১৮০০ ওয়াট। Rapid hot air circulation প্রযুক্তির কারণে প্রতিদিন ৩০ মিনিট ব্যবহার করলে মাসে আনুমানিক ২৫ থেকে ২৮ ইউনিট বিদ্যুৎ খরচ হয়, যা অত্যন্ত সাশ্রয়ী।"},
                "reply": "আমাদের 6.5L XXL Air Fryer (৳6800) এর রেটেড পাওয়ার ১৮০০ ওয়াট। Rapid hot air circulation প্রযুক্তির কারণে প্রতিদিন ৩০ মিনিট ব্যবহার করলে মাসে আনুমানিক ২৫ থেকে ২৮ ইউনিট বিদ্যুৎ খরচ হয়, যা অত্যন্ত সাশ্রয়ী।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Eitate ki 1kg chicken whole roast kora jabe ekbare?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product capacity inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "জি, ৬.৫ লিটার XXL বাস্কেট বেশ প্রশস্ত হওয়ায় ১ কেজি ওজনের আস্ত মুরগি খুব সহজেই এতে রোস্ট করা যায়।"},
                "reply": "জি, ৬.৫ লিটার XXL বাস্কেট বেশ প্রশস্ত হওয়ায় ১ কেজি ওজনের আস্ত মুরগি খুব সহজেই এতে রোস্ট করা যায়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05325": {
        "scenario": "v_novel_appliances_vacuum_battery",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "What is the runtime and battery specification for the Smart Cyclone Cordless Stick Vacuum Cleaner?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Technical specification", "Battery inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The Smart Cyclone Cordless Vacuum (৳9200) is powered by a 2200mAh detachable lithium-ion pack. It delivers up to 45 minutes on Eco mode and 18-20 minutes on Turbo suction mode, fully recharging in 4 hours."},
                "reply": "The Smart Cyclone Cordless Vacuum (৳9200) is powered by a 2200mAh detachable lithium-ion pack. It delivers up to 45 minutes on Eco mode and 18-20 minutes on Turbo suction mode, fully recharging in 4 hours."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_03339": {
        "scenario": "v_novel_appliances_cake_baking",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "এয়ার ফ্রায়ারের ভেতরে কেক বেকিং করতে চাইলে কত ইঞ্চি সাইজের মোল্ড বা পাত্র ব্যবহার করা যাবে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Product inquiry", "Cooking compatibility"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Digital Touchscreen Air Fryer (6.5L XXL)-এর স্কয়ার বাস্কেটে ৭ থেকে ৮ ইঞ্চি ব্যাসের বেকিং কেক মোল্ড বা সিলিকন প্যান অনায়াসে বসানো যায়। টেম্পারেচার ৮০°C থেকে ২০০°C পর্যন্ত সহজে নিয়ন্ত্রণ করা যায়।"},
                "reply": "আমাদের Digital Touchscreen Air Fryer (6.5L XXL)-এর স্কয়ার বাস্কেটে ৭ থেকে ৮ ইঞ্চি ব্যাসের বেকিং কেক মোল্ড বা সিলিকন প্যান অনায়াসে বসানো যায়। টেম্পারেচার ৮০°C থেকে ২০০°C পর্যন্ত সহজে নিয়ন্ত্রণ করা যায়।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "ঢাকায় ডেলিভারি চার্জ আর সময় কত পড়বে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Delivery inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ঢাকার ভেতরে ডেলিভারি চার্জ ৳১০০ এবং ডেলিভারি সময় ২৪ থেকে ৪৮ ঘণ্টা।"},
                "reply": "ঢাকার ভেতরে ডেলিভারি চার্জ ৳১০০ এবং ডেলিভারি সময় ২৪ থেকে ৪৮ ঘণ্টা।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_01215": {
        "scenario": "v_novel_appliances_hepa_wash",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Cordless Stick Vacuum Cleaner er HEPA filter ta ki pani diye wash kora jay?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product care", "Maintenance inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ji, Cyclone Vacuum Cleaner (৳9200) er multi-layer HEPA filter ti shitol pani diye wash kora jay। Tobe abar machine e laganor purbe roder niche ba haway ontoto 24 hours shompurno shukate hobe jate motor safe thake।"},
                "reply": "Ji, Cyclone Vacuum Cleaner (৳9200) er multi-layer HEPA filter ti shitol pani diye wash kora jay। Tobe abar machine e laganor purbe roder niche ba haway ontoto 24 hours shompurno shukate hobe jate motor safe thake।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_01345": {
        "scenario": "v_novel_appliances_basket_coating",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Air Fryer er non-stick basket ki abrasive wire mesh diye ghoshle coating nosto hoye jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product care"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Doya kore wire mesh ba dharalo scrubber bebohar korben na। Non-stick coating shurokkha rakhte ushno pani, mild dishwashing liquid ebong soft sponge bebohar korle coating dirghodin pristine thakbe।"},
                "reply": "Doya kore wire mesh ba dharalo scrubber bebohar korben na। Non-stick coating shurokkha rakhte ushno pani, mild dishwashing liquid ebong soft sponge bebohar korle coating dirghodin pristine thakbe।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05251": {
        "scenario": "v_novel_appliances_vacuum_nozzles",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "What motorized floor attachments are included in the box for the Smart Cyclone Cordless Vacuum?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Product contents", "Technical specification"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The Smart Cyclone Vacuum (৳9200) includes a motorized LED roller floor brush for hard surfaces, a specialized 2-in-1 crevice tool for sofas and car interiors, and a wall-mount charging dock."},
                "reply": "The Smart Cyclone Vacuum (৳9200) includes a motorized LED roller floor brush for hard surfaces, a specialized 2-in-1 crevice tool for sofas and car interiors, and a wall-mount charging dock."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05300": {
        "scenario": "v_novel_appliances_video_policy",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "If an appliance develops a motor fault upon unboxing, what is the exact return policy procedure?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Policy inquiry", "Return policy"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Under our store policy, technical defects reported within 7 days of delivery with an unboxing video showing the fault are eligible for full inspection and replacement assistance."},
                "reply": "Under our store policy, technical defects reported within 7 days of delivery with an unboxing video showing the fault are eligible for full inspection and replacement assistance."
            }, ensure_ascii=False)},
            {"role": "user", "content": "What is the shipping fee to Bogura outside Dhaka?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Shipping fee inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Delivery outside Dhaka (such as Bogura) is ৳220 via insured courier, and delivery takes 48 to 72 hours."},
                "reply": "Delivery outside Dhaka (such as Bogura) is ৳220 via insured courier, and delivery takes 48 to 72 hours."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05201": {
        "scenario": "v_novel_appliances_safety_switch",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_appliances_07", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for ElectroHome Appliances (Home & Kitchen Appliances). Brand tone: professional. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Does the Digital Touchscreen Air Fryer have an automatic shut-off safety sensor if the basket is pulled out during cooking?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Safety feature inquiry", "Technical specification"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Yes! The 6.5L XXL Air Fryer features a built-in safety micro-switch that automatically pauses heating and the timer whenever the frying basket is pulled out, resuming immediately once pushed back in."},
                "reply": "Yes! The 6.5L XXL Air Fryer features a built-in safety micro-switch that automatically pauses heating and the timer whenever the frying basket is pulled out, resuming immediately once pushed back in."
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 3: tenant_jewelry_09 (LuxeShine Artisans) - 7 records
    # -------------------------------------------------------------
    "kz_b5_09532": {
        "scenario": "v_novel_jewelry_choker_tarnish",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "18K Gold-Plated Choker Necklace daily wear korle ki shonge shonge tarnish ba shonali rong fade hoye jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product care", "Jewelry durability"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Amader Celestial Dual-Layer Choker (৳1850) anti-tarnish protective e-coating jukto। Tobe plating er dirghojibon nishchit korte perfume, lotion ba shobashori panir shongsporsho theke dure rakha ebong beboharer por velvet pouch e rakhar poramorsho dewa hoy।"},
                "reply": "Amader Celestial Dual-Layer Choker (৳1850) anti-tarnish protective e-coating jukto। Tobe plating er dirghojibon nishchit korte perfume, lotion ba shobashori panir shongsporsho theke dure rakha ebong beboharer por velvet pouch e rakhar poramorsho dewa hoy।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05482": {
        "scenario": "v_novel_jewelry_baroque_pearls",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Are the Baroque Freshwater Pearl Drop Earrings made with genuine natural pearls, and do their shapes vary?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Product authenticity", "Material inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Yes, our Baroque Pearl Drop Earrings (৳1450) feature genuine cultivated freshwater pearls. Due to their natural organic formation, each pearl has subtle, unique contour variations that make every pair one-of-a-kind."},
                "reply": "Yes, our Baroque Pearl Drop Earrings (৳1450) feature genuine cultivated freshwater pearls. Due to their natural organic formation, each pearl has subtle, unique contour variations that make every pair one-of-a-kind."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_03475": {
        "scenario": "v_novel_jewelry_earring_hygiene",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "কানের দুল পরার পর কি রিটার্ন বা এক্সচেঞ্জ করা যায় যদি কানে ম্যাচ না করে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Policy inquiry", "Return policy"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "কানের দুলের ক্ষেত্রে কঠোর স্বাস্থ্যবিধি ও হাইজিন পলিসির কারণে একবার ব্যবহারের পর এক্সচেঞ্জ বা রিটার্ন গ্রহণযোগ্য নয়। তবে ডেলিভারির সময় পার্সেল ক্ষতিগ্রস্ত থাকলে আনবক্সিং ভিডিও সহ ৪৮ ঘণ্টার মধ্যে জানালে রিপ্লেসমেন্ট সহযোগিতা পাবেন।"},
                "reply": "কানের দুলের ক্ষেত্রে কঠোর স্বাস্থ্যবিধি ও হাইজিন পলিসির কারণে একবার ব্যবহারের পর এক্সচেঞ্জ বা রিটার্ন গ্রহণযোগ্য নয়। তবে ডেলিভারির সময় পার্সেল ক্ষতিগ্রস্ত থাকলে আনবক্সিং ভিডিও সহ ৪৮ ঘণ্টার মধ্যে জানালে রিপ্লেসমেন্ট সহযোগিতা পাবেন।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_01439": {
        "scenario": "v_novel_jewelry_extender_chain",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Celestial Dual-Layer Choker Necklace er chain length koto? eita ki adjust kora jay neck size onujayi?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product dimensions", "Sizing inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ji, choker ti 14 inch base length ebong shathe 2.5 inch adjustable extension chain jukto, ja diye apni apnar shubidhamoto choker fit ba collarbone length e adjust korte parben।"},
                "reply": "Ji, choker ti 14 inch base length ebong shathe 2.5 inch adjustable extension chain jukto, ja diye apni apnar shubidhamoto choker fit ba collarbone length e adjust korte parben।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Dhaka te luxury gift packaging e ashbe to?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Packaging inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Oboshshoi! Dhakar moddhe 24 to 36 hours e luxury gift box with elegant satin ribbon e pack hoye delivery hoy, delivery charge ৳80।"},
                "reply": "Oboshshoi! Dhakar moddhe 24 to 36 hours e luxury gift box with elegant satin ribbon e pack hoye delivery hoy, delivery charge ৳80।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07453": {
        "scenario": "v_novel_jewelry_shower_damage",
        "language": "mixed",
        "metadata": {"priority": "MEDIUM", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Gold-plated jewelry pore ki shower neya jabe, naki metal oxided hoye jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product care", "Jewelry maintenance"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Plated jewelry পরে গোসল করা বা সাঁতার কাটা সম্পূর্ণ নিষেধ, কারণ সাবান ও পানির রাসায়নিক বিক্রিয়ায় সোনার প্রলেপ নষ্ট হয়ে যেতে পারে। শুকনো অবস্থায় রাখলে গহনার উজ্জ্বলতা দীর্ঘদিন অটুট থাকে।"},
                "reply": "Plated jewelry পরে গোসল করা বা সাঁতার কাটা সম্পূর্ণ নিষেধ, কারণ সাবান ও পানির রাসায়নিক বিক্রিয়ায় সোনার প্রলেপ নষ্ট হয়ে যেতে পারে। শুকনো অবস্থায় রাখলে গহনার উজ্জ্বলতা দীর্ঘদিন অটুট থাকে।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_03579": {
        "scenario": "v_novel_jewelry_hypoallergenic",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "আমি সংবেদনশীল ত্বকের মানুষ, আপনাদের ১৮কে গোল্ড-প্লেটেড চোকার কি নিকেল-মুক্ত?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Allergy safety", "Material inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "জি, আমাদের Celestial Dual-Layer Choker (৳১৮৫০) সম্পূর্ণ হাইপোঅ্যালার্জেনিক এবং নিকেল ও লেড-মুক্ত ব্রাস বেসের ওপর ১৮ ক্যারেট গোল্ড প্লেটিং করা, যা সংবেদনশীল ত্বকের জন্য নিরাপদ।"},
                "reply": "জি, আমাদের Celestial Dual-Layer Choker (৳১৮৫০) সম্পূর্ণ হাইপোঅ্যালার্জেনিক এবং নিকেল ও লেড-মুক্ত ব্রাস বেসের ওপর ১৮ ক্যারেট গোল্ড প্লেটিং করা, যা সংবেদনশীল ত্বকের জন্য নিরাপদ।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "চট্টগ্রামে পাঠাতে কত দিন সময় লাগে এবং চার্জ কত?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Delivery inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ঢাকার বাইরে (যেমন চট্টগ্রামে) RedX Express-এর মাধ্যমে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে পৌঁছায় এবং ডেলিভারি চার্জ ৳১৪০।"},
                "reply": "ঢাকার বাইরে (যেমন চট্টগ্রামে) RedX Express-এর মাধ্যমে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে পৌঁছায় এবং ডেলিভারি চার্জ ৳১৪০।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_03431": {
        "scenario": "v_novel_jewelry_bent_stem",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_jewelry_09", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for LuxeShine Artisans (Fine & Semi-Precious Jewelry). Brand tone: elegant. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "ডেলিভারি পাওয়ার পর পার্সেলের ভেতরে যদি মুক্তার দুল বাঁকা পাওয়া যায়, তবে কীভাবে ক্লেইম করতে হবে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Transit damage claim", "Customer support"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ডেলিভারির সময় বা আনবক্সিংয়ের স্পষ্ট ভিডিওসহ ৪৮ ঘণ্টার মধ্যে আমাদের জানান। কুরিয়ার ট্রানজিট ড্যামেজ পলিসি অনুযায়ী ক্লেইমস টিম দ্রুত যাচাই করে রিপ্লেসমেন্ট প্রসেসিংয়ে সরাসরি সহায়তা করবে।"},
                "reply": "ডেলিভারির সময় বা আনবক্সিংয়ের স্পষ্ট ভিডিওসহ ৪৮ ঘণ্টার মধ্যে আমাদের জানান। কুরিয়ার ট্রানজিট ড্যামেজ পলিসি অনুযায়ী ক্লেইমস টিম দ্রুত যাচাই করে রিপ্লেসমেন্ট প্রসেসিংয়ে সরাসরি সহায়তা করবে।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 4: tenant_fashion_01 (Aura Threads) - 5 records
    # -------------------------------------------------------------
    "kz_b1_00580": {
        "scenario": "v_novel_fashion_panjabi_fabric",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_fashion_01", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for Aura Threads (Fashion & Apparel). Brand tone: modern. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Royal Emerald Semi-Kaptan Panjabi ta ki pure cotton fabric naki mixed viscose?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Fabric inquiry", "Product details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Royal Emerald Semi-Kaptan Panjabi (৳2650) high-grade breathable cotton-viscose blend jacquard weave e toiri, ja lightweight drop ebong elegant drape nishchit kore।"},
                "reply": "Royal Emerald Semi-Kaptan Panjabi (৳2650) high-grade breathable cotton-viscose blend jacquard weave e toiri, ja lightweight drop ebong elegant drape nishchit kore।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Eitar washing instruction ki? Machine wash kora jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Washing instructions"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Embroidery o fabric luster dhore rakhte mild detergent diye gentle hand wash ba delicate dry clean korar poramorsho dewa hoy।"},
                "reply": "Embroidery o fabric luster dhore rakhte mild detergent diye gentle hand wash ba delicate dry clean korar poramorsho dewa hoy।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_02410": {
        "scenario": "v_novel_fashion_saree_blouse",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_fashion_01", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for Aura Threads (Fashion & Apparel). Brand tone: modern. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Soft Jamdani Motif Cotton Saree-এর সাথে কি রানিং ব্লাউজ পিস অন্তর্ভুক্ত আছে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Product details", "Saree inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Soft Jamdani Motif Cotton Saree (৳৩৮০০) ১২ হাত বা ৫.৫ মিটার দৈর্ঘ্যের সম্পূর্ণ প্রিমিয়াম কটন শাড়ি। এতে কোনো রানিং ব্লাউজ পিস অন্তর্ভুক্ত নেই; এটি একক শাড়ি হিসেবে পরিবেশিত হয়।"},
                "reply": "আমাদের Soft Jamdani Motif Cotton Saree (৳৩৮০০) ১২ হাত বা ৫.৫ মিটার দৈর্ঘ্যের সম্পূর্ণ প্রিমিয়াম কটন শাড়ি। এতে কোনো রানিং ব্লাউজ পিস অন্তর্ভুক্ত নেই; এটি একক শাড়ি হিসেবে পরিবেশিত হয়।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "যদি পরা ছাড়া শুধু দেখে পছন্দ না হয়, এক্সচেঞ্জ করা যাবে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Exchange policy inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ট্যাগ অক্ষত এবং অব্যবহৃত অবস্থায় থাকলে ডেলিভারির ৭ দিনের মধ্যে আমাদের পলিসি অনুযায়ী ইজি এক্সচেঞ্জ সুবিধা পাবেন।"},
                "reply": "ট্যাগ অক্ষত এবং অব্যবহৃত অবস্থায় থাকলে ডেলিভারির ৭ দিনের মধ্যে আমাদের পলিসি অনুযায়ী ইজি এক্সচেঞ্জ সুবিধা পাবেন।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_04404": {
        "scenario": "v_novel_fashion_tee_gsm",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_fashion_01", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for Aura Threads (Fashion & Apparel). Brand tone: modern. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "What is the fabric weight (GSM) and collar rib construction of the Heavyweight Oversized Minimalist Tee?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Technical specification", "Fabric details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The Heavyweight Oversized Minimalist Tee (৳850) is crafted from 240 GSM 100% combed compact cotton with a dense 1.25-inch Lycra-reinforced rib collar that prevents bacon-neck stretching."},
                "reply": "The Heavyweight Oversized Minimalist Tee (৳850) is crafted from 240 GSM 100% combed compact cotton with a dense 1.25-inch Lycra-reinforced rib collar that prevents bacon-neck stretching."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_06528": {
        "scenario": "v_novel_fashion_tee_shrinkage",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_fashion_01", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for Aura Threads (Fashion & Apparel). Brand tone: modern. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Heavyweight Oversized Tee wash korle ki shrink hoye choto hoye jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Care advice"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের ফেব্রিক প্রাক-সংকোচিত (pre-shrunk) ও bio-washed, তাই স্বাভাবিক ঠান্ডা পানিতে ধুলে মাত্র ১-২% সংকোচন হতে পারে, যা টি-শার্টের ফিটে কোনো পরিবর্তন ফেলে না।"},
                "reply": "আমাদের ফেব্রিক প্রাক-সংকোচিত (pre-shrunk) ও bio-washed, তাই স্বাভাবিক ঠান্ডা পানিতে ধুলে মাত্র ১-২% সংকোচন হতে পারে, যা টি-শার্টের ফিটে কোনো পরিবর্তন ফেলে না।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_04599": {
        "scenario": "v_novel_fashion_saree_sheerness",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_fashion_01", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for Aura Threads (Fashion & Apparel). Brand tone: modern. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "How sheer is the Soft Jamdani Motif Cotton Saree? Does it require heavy underskirt lining?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Product inquiry", "Material transparency"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The Soft Jamdani Motif Cotton Saree (৳3800) is woven with high-count fine cotton thread. It offers an elegant, semi-sheer traditional texture that drapes comfortably over a standard cotton petticoat without feeling stiff."},
                "reply": "The Soft Jamdani Motif Cotton Saree (৳3800) is woven with high-count fine cotton thread. It offers an elegant, semi-sheer traditional texture that drapes comfortably over a standard cotton petticoat without feeling stiff."
            }, ensure_ascii=False)},
            {"role": "user", "content": "What is the delivery timeline to Sylhet?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Shipping inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Delivery outside Dhaka to Sylhet is ৳130, and orders arrive within 48 to 72 hours."},
                "reply": "Delivery outside Dhaka to Sylhet is ৳130, and orders arrive within 48 to 72 hours."
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 5: tenant_grocery_04 (DailyBazaar Organics) - 5 records
    # -------------------------------------------------------------
    "kz_b2_03009": {
        "scenario": "v_novel_grocery_mustard_ghani",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_grocery_04", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for DailyBazaar Organics (Organic Grocery & Pantry). Brand tone: trustworthy. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Pure Cold-Pressed Wood-Milled Mustard Oil কীভাবে ভাঙানো হয়? কোনো কৃত্রিম ঝাঁঝ মেশানো আছে কি?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Product purity inquiry", "Extraction process"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের কাঠের ঘানির সরিষার তেল (১ লিটার, ৳৩৮০) ধীরগতির কাঠের ঘানিতে ৪০° সেলসিয়াসের নিচে কোল্ড-প্রেসড পদ্ধতিতে ভাঙানো হয়। এতে কোনো কৃত্রিম এসেন্স, রাসায়নিক বা রিফাইন্ড অয়েল নেই; প্রাকৃতিক কড়া ঝাঁঝ পুরোপুরি অক্ষুণ্ণ।"},
                "reply": "আমাদের কাঠের ঘানির সরিষার তেল (১ লিটার, ৳৩৮০) ধীরগতির কাঠের ঘানিতে ৪০° সেলসিয়াসের নিচে কোল্ড-প্রেসড পদ্ধতিতে ভাঙানো হয়। এতে কোনো কৃত্রিম এসেন্স, রাসায়নিক বা রিফাইন্ড অয়েল নেই; প্রাকৃতিক কড়া ঝাঁঝ পুরোপুরি অক্ষুণ্ণ।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "আজকে সকাল ১১টায় ধানমন্ডিতে অর্ডার করলে কি আজকেই ডেলিভারি পাব?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Delivery cutoff inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "হ্যাঁ! দুপুর ১২টার পূর্বে অর্ডার কনফার্ম হলে ঢাকার ভেতরে সেম-ডে ডেলিভারি পলিসি অনুযায়ী আজকেই পাবেন, ডেলিভারি চার্জ ৳৬০।"},
                "reply": "হ্যাঁ! দুপুর ১২টার পূর্বে অর্ডার কনফার্ম হলে ঢাকার ভেতরে সেম-ডে ডেলিভারি পলিসি অনুযায়ী আজকেই পাবেন, ডেলিভারি চার্জ ৳৬০।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_09175": {
        "scenario": "v_novel_grocery_bilona_granules",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_grocery_04", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for DailyBazaar Organics (Organic Grocery & Pantry). Brand tone: trustworthy. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Grass-Fed Cultured Bilona Cow Ghee er texture ki danadar naki liquid?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product inquiry", "Texture details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Amader Bilona Cow Ghee (500g, ৳950) traditional dahi-fermented makhan theke slow heat e toiri, tai er texture natural danadar ebong aroma khub shugondhi hoy।"},
                "reply": "Amader Bilona Cow Ghee (500g, ৳950) traditional dahi-fermented makhan theke slow heat e toiri, tai er texture natural danadar ebong aroma khub shugondhi hoy।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Room temperature e koto din bhalo thakbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Shelf life inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Air-tight glass jar e dry o andhar sthane room temperature e 6 theke 8 mash porjonto er shwad o gunagun pristine thake।"},
                "reply": "Air-tight glass jar e dry o andhar sthane room temperature e 6 theke 8 mash porjonto er shwad o gunagun pristine thake।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_09164": {
        "scenario": "v_novel_grocery_honey_crystallization",
        "language": "banglish",
        "metadata": {"priority": "MEDIUM", "tenant_id": "tenant_grocery_04", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for DailyBazaar Organics (Organic Grocery & Pantry). Brand tone: trustworthy. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Sundarbans Mangrove Honey shiter shomoy shob niche jome shada hoye gache, eita ki bhezal chinir jonno?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product inquiry", "Customer concern"], "priority": "MEDIUM", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Shob natural raw unpasteurized modhu te natural glucose level high thakle shiter thandai crystallization ba joma badha ekdom normal natural characteristic! Glass jar ti kicho somoy ushno gorom panir patre rakhlei eita abar transparent liquid hoye jabe।"},
                "reply": "Shob natural raw unpasteurized modhu te natural glucose level high thakle shiter thandai crystallization ba joma badha ekdom normal natural characteristic! Glass jar ti kicho somoy ushno gorom panir patre rakhlei eita abar transparent liquid hoye jabe।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07101": {
        "scenario": "v_novel_grocery_doorstep_leak",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_grocery_04", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for DailyBazaar Organics (Organic Grocery & Pantry). Brand tone: trustworthy. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Delivery man ashle jodi dekhi mustard oil er jar ta cracked ba leak korche, tokhon ki korbo?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Policy inquiry", "Return on doorstep"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "কুরিয়ার ডেলিভারির সময় বোতল ফাটা বা লিক দেখলে রাইডারের কাছেই তৎক্ষণাৎ ডোরস্টেপ রিটার্ন করে দিন। আমাদের পলিসি অনুযায়ী বোতল ক্ষতিগ্রস্ত হলে ডেলিভারি মুহূর্তে তাৎক্ষণিক রিটার্ন সম্পূর্ণ গ্রহণযোগ্য।"},
                "reply": "কুরিয়ার ডেলিভারির সময় বোতল ফাটা বা লিক দেখলে রাইডারের কাছেই তৎক্ষণাৎ ডোরস্টেপ রিটার্ন করে দিন। আমাদের পলিসি অনুযায়ী বোতল ক্ষতিগ্রস্ত হলে ডেলিভারি মুহূর্তে তাৎক্ষণিক রিটার্ন সম্পূর্ণ গ্রহণযোগ্য।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07049": {
        "scenario": "v_novel_grocery_honey_pollen",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_grocery_04", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for DailyBazaar Organics (Organic Grocery & Pantry). Brand tone: trustworthy. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "DailyBazaar Organics er Sundarbans Honey ki unpasteurized raw naki filtered?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Nutritional details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "আমাদের Raw Wild Sundarbans Mangrove Honey (500g, ৳750) সম্পূর্ণ অপরিশোধিত ও কাঁচা। এতে কৃত্রিম কোনো তাপ দেওয়া হয় না, ফলে পরাগরেণু ও প্রাকৃতিক এনজাইম পুরোপুরি অক্ষুণ্ণ থাকে।"},
                "reply": "আমাদের Raw Wild Sundarbans Mangrove Honey (500g, ৳750) সম্পূর্ণ অপরিশোধিত ও কাঁচা। এতে কৃত্রিম কোনো তাপ দেওয়া হয় না, ফলে পরাগরেণু ও প্রাকৃতিক এনজাইম পুরোপুরি অক্ষুণ্ণ থাকে।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Chittagong e send korle koto din lagbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Delivery timeline inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "ঢাকার বাইরে তাপনিয়ন্ত্রিত পার্সেলের মাধ্যমে ৩ থেকে ৪ কার্যদিবসের মধ্যে চট্টগ্রাম পৌঁছাবে এবং ডেলিভারি চার্জ ৳১৪০।"},
                "reply": "ঢাকার বাইরে তাপনিয়ন্ত্রিত পার্সেলের মাধ্যমে ৩ থেকে ৪ কার্যদিবসের মধ্যে চট্টগ্রাম পৌঁছাবে এবং ডেলিভারি চার্জ ৳১৪০।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 6: tenant_electronics_02 (VoltTech Gadgets) - 4 records
    # -------------------------------------------------------------
    "kz_b1_00233": {
        "scenario": "v_novel_electronics_anc_airplane",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_electronics_02", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for VoltTech Gadgets (Consumer Electronics). Brand tone: innovative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "VoltTech Apex Wireless ANC Headphones er active noise cancellation ki airplane engine noise ba bus traffic effectively block kore?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Technical specification", "ANC performance"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "VoltTech Apex ANC Headphones (৳2850) e hybrid dual-mic active noise cancellation ase, ja low-frequency engine hum ebong urban traffic noise prai 28dB porjonto effectively attenuate kore। Bluetooth 5.3 er sathe 3.5mm AUX cable o include kora thake।"},
                "reply": "VoltTech Apex ANC Headphones (৳2850) e hybrid dual-mic active noise cancellation ase, ja low-frequency engine hum ebong urban traffic noise prai 28dB porjonto effectively attenuate kore। Bluetooth 5.3 er sathe 3.5mm AUX cable o include kora thake।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b2_02214": {
        "scenario": "v_novel_electronics_watch_ip68",
        "language": "bangla",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_electronics_02", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for VoltTech Gadgets (Consumer Electronics). Brand tone: innovative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "VoltTech Pulse AMOLED Smartwatch কি সাঁতার কাটার সময় ব্যবহার করা যাবে নাকি শুধু হালকা বৃষ্টি সহ্য করতে পারে?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "bangla", "intents": ["Water resistance inquiry", "Product specifications"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Pulse AMOLED Smartwatch (৳৩৬০০) IP68 ডাস্ট ও ওয়াটার রেজিস্ট্যান্ট সার্টিফাইড। এটি হাত ধোয়া, ঘাম এবং হালকা বৃষ্টির স্প্ল্যাশ সহজে সহ্য করতে পারে। তবে অতিরিক্ত পানির চাপ, সাঁতার বা গরম পানির শাওয়ারে পরিহার করার পরামর্শ দেওয়া হয়।"},
                "reply": "Pulse AMOLED Smartwatch (৳৩৬০০) IP68 ডাস্ট ও ওয়াটার রেজিস্ট্যান্ট সার্টিফাইড। এটি হাত ধোয়া, ঘাম এবং হালকা বৃষ্টির স্প্ল্যাশ সহজে সহ্য করতে পারে। তবে অতিরিক্ত পানির চাপ, সাঁতার বা গরম পানির শাওয়ারে পরিহার করার পরামর্শ দেওয়া হয়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_04254": {
        "scenario": "v_novel_electronics_airbuds_codecs",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_electronics_02", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for VoltTech Gadgets (Consumer Electronics). Brand tone: innovative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "What audio codecs do the VoltTech AirBuds Bass Pro TWS support on Android and iPhone devices?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Audio codecs", "Technical specification"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The VoltTech AirBuds Bass Pro TWS (৳1450) support AAC and SBC HD audio codecs with 13mm dynamic titanium drivers, delivering low-latency synchronization on both iOS and Android platforms."},
                "reply": "The VoltTech AirBuds Bass Pro TWS (৳1450) support AAC and SBC HD audio codecs with 13mm dynamic titanium drivers, delivering low-latency synchronization on both iOS and Android platforms."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_06310": {
        "scenario": "v_novel_electronics_earpad_cushion",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_electronics_02", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for VoltTech Gadgets (Consumer Electronics). Brand tone: innovative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Apex ANC Headphones er ear cushion ki replaceable protein leather naki fabric?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Material inquiry", "Comfort details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Apex ANC Headphones এ soft memory-foam সমৃদ্ধ breathable protein leather earpad ব্যবহার করা হয়েছে, যা দীর্ঘক্ষণ কানে চাপ ছাড়া আরামদায়ক অভিজ্ঞতা দেয়।"},
                "reply": "Apex ANC Headphones এ soft memory-foam সমৃদ্ধ breathable protein leather earpad ব্যবহার করা হয়েছে, যা দীর্ঘক্ষণ কানে চাপ ছাড়া আরামদায়ক অভিজ্ঞতা দেয়।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Narayanganj e delivery charge koto pore?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Delivery charge inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "নারায়ণগঞ্জে Steadfast Express কুরিয়ারের মাধ্যমে ৪৮ ঘণ্টার মধ্যে ডেলিভারি পৌঁছায় এবং চার্জ ৳১২০।"},
                "reply": "নারায়ণগঞ্জে Steadfast Express কুরিয়ারের মাধ্যমে ৪৮ ঘণ্টার মধ্যে ডেলিভারি পৌঁছায় এবং চার্জ ৳১২০।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 7: tenant_mobile_acc_06 (GearPulse Accessories) - 4 records
    # -------------------------------------------------------------
    "kz_b5_09608": {
        "scenario": "v_novel_mobile_gan_macbook",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_mobile_acc_06", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GearPulse Accessories (Mobile & Gadget Accessories). Brand tone: tech-forward. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "65W GaN Fast Charger die ki ekshathe MacBook Air ebong iPhone fast charge kora jabe power drop chara?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Technical specification", "Compatibility"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "জি! 65W GaN Dual Type-C + USB Wall Charger (৳1850) ইন্টেলিজেন্ট ডাইনামিক পাওয়ার শেয়ারিং সাপোর্ট করে। দুটি পোর্ট একসাথে ব্যবহারে Type-C1 পোর্টে 45W এবং অন্য পোর্টে 20W পাওয়ার দেয়, যা ল্যাপটপ ও ফোন একই সাথে দ্রুত চার্জ করার জন্য যথেষ্ট।"},
                "reply": "জি! 65W GaN Dual Type-C + USB Wall Charger (৳1850) ইন্টেলিজেন্ট ডাইনামিক পাওয়ার শেয়ারিং সাপোর্ট করে। দুটি পোর্ট একসাথে ব্যবহারে Type-C1 পোর্টে 45W এবং অন্য পোর্টে 20W পাওয়ার দেয়, যা ল্যাপটপ ও ফোন একই সাথে দ্রুত চার্জ করার জন্য যথেষ্ট।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_05634": {
        "scenario": "v_novel_mobile_case_bezel",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_mobile_acc_06", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GearPulse Accessories (Mobile & Gadget Accessories). Brand tone: tech-forward. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Does the Frosted Magnetic Shockproof Case have raised lips around the camera bump to protect lenses when placed flat?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Product inquiry", "Case protection features"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Yes, the Frosted Magnetic Shockproof Case (৳750) features a 1.5mm raised screen bezel and a 2.0mm reinforced camera guard ring, ensuring lenses never contact flat surfaces."},
                "reply": "Yes, the Frosted Magnetic Shockproof Case (৳750) features a 1.5mm raised screen bezel and a 2.0mm reinforced camera guard ring, ensuring lenses never contact flat surfaces."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_09722": {
        "scenario": "v_novel_mobile_cable_emarker",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_mobile_acc_06", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GearPulse Accessories (Mobile & Gadget Accessories). Brand tone: tech-forward. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Braided 100W PD Type-C to Type-C Cable e ki E-Marker chip ase? laptop e 100W power delivery support korbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Cable specifications", "Power delivery"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ji, amader Braided 100W PD Cable (৳450) certified E-Marker safety chipset jukto, ja up to 20V/5A 100W fast charging ebong 480Mbps data transfer shompurno support kore।"},
                "reply": "Ji, amader Braided 100W PD Cable (৳450) certified E-Marker safety chipset jukto, ja up to 20V/5A 100W fast charging ebong 480Mbps data transfer shompurno support kore।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_07730": {
        "scenario": "v_novel_mobile_case_matte",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_mobile_acc_06", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GearPulse Accessories (Mobile & Gadget Accessories). Brand tone: tech-forward. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Frosted Magnetic Case er back panel ki finger print resistant matte finish naki shiny?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Material inquiry", "Case finish"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "এটি সূক্ষ্ম frosted matte পলিকার্বোনেট ফিনিশে তৈরি, যা তেল চিটচিটে আঙুলের ছাপ সম্পূর্ণ প্রতিরোধ করে এবং শক্তিশালী N52 MagSafe ম্যাগনেট যুক্ত।"},
                "reply": "এটি সূক্ষ্ম frosted matte পলিকার্বোনেট ফিনিশে তৈরি, যা তেল চিটচিটে আঙুলের ছাপ সম্পূর্ণ প্রতিরোধ করে এবং শক্তিশালী N52 MagSafe ম্যাগনেট যুক্ত।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Gazipur e delivery koto time lage Pathao Logistics e?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Delivery inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "গাজীপুরে Pathao Logistics-এর মাধ্যমে ৪৮ ঘণ্টার মধ্যে ডেলিভারি পৌঁছায় এবং চার্জ ৳১১০।"},
                "reply": "গাজীপুরে Pathao Logistics-এর মাধ্যমে ৪৮ ঘণ্টার মধ্যে ডেলিভারি পৌঁছায় এবং চার্জ ৳১১০।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 8: tenant_general_10 (MegaMart Direct) - 4 records
    # -------------------------------------------------------------
    "kz_b4_06928": {
        "scenario": "v_novel_general_bottle_led",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_general_10", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for MegaMart Direct (General Multi-Category Retail). Brand tone: helpful. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Insulated Thermal Smart Water Bottle er cap er LED temperature display battery ki change kora jay naki non-replaceable?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Technical specification", "Battery details"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Insulated Smart Water Bottle (৳850) এর ক্যাপে ওয়াটারপ্রুফ আল্ট্রা-লো পাওয়ার এমবেডেড ব্যাটারি থাকে, যা ব্যাটারি পরিবর্তন ছাড়াই প্রায় ২ বছর (৮০,০০০+ টাচ) সচল থাকে।"},
                "reply": "Insulated Smart Water Bottle (৳850) এর ক্যাপে ওয়াটারপ্রুফ আল্ট্রা-লো পাওয়ার এমবেডেড ব্যাটারি থাকে, যা ব্যাটারি পরিবর্তন ছাড়াই প্রায় ২ বছর (৮০,০০০+ টাচ) সচল থাকে।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_08930": {
        "scenario": "v_novel_general_closet_magnet",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_general_10", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for MegaMart Direct (General Multi-Category Retail). Brand tone: helpful. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Rechargeable Motion-Sensor Magnetic Closet Light ta wardrob er kather gay e kivabe attach korbo?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Installation inquiry", "Product mounting"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Closet Light (৳550) er box e double-sided 3M adhesive jukto magnetic metal strip thake। Strip ti kather gay e stick kore light ti magnet er sahajje easily attach o recharge er jonno detach kora jay।"},
                "reply": "Closet Light (৳550) er box e double-sided 3M adhesive jukto magnetic metal strip thake। Strip ti kather gay e stick kore light ti magnet er sahajje easily attach o recharge er jonno detach kora jay।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Full charge e motion sensing mode e koto din jabe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Battery backup inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Daily 8 theke 10 bar auto-trigger hole PIR sensing mode e ek charge e 25 theke 30 din porjonto backup dey।"},
                "reply": "Daily 8 theke 10 bar auto-trigger hole PIR sensing mode e ek charge e 25 theke 30 din porjonto backup dey।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b3_04932": {
        "scenario": "v_novel_general_blender_ice",
        "language": "english",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_general_10", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for MegaMart Direct (General Multi-Category Retail). Brand tone: helpful. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Can the Portable USB Smoothie Blender (6 Blades) blend small ice cubes and frozen berries without stalling the motor?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "english", "intents": ["Technical specification", "Blender motor performance"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "The Portable USB Blender (৳1250) features a 6-blade 304 stainless steel assembly powered by a high-torque 7.4V motor. It blends softened frozen berries and crushed ice easily when combined with at least 30% liquid (water, milk, or juice)."},
                "reply": "The Portable USB Blender (৳1250) features a 6-blade 304 stainless steel assembly powered by a high-torque 7.4V motor. It blends softened frozen berries and crushed ice easily when combined with at least 30% liquid (water, milk, or juice)."
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_08901": {
        "scenario": "v_novel_general_bottle_temp",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_general_10", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for MegaMart Direct (General Multi-Category Retail). Brand tone: helpful. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Insulated Smart Water Bottle e gorom tea rakhle koto ghonta gorom thakbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Thermal performance", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Smart Bottle (৳850) double-wall vacuum insulation technology thakay hot beverage 12 hours porjonto gorom ebong cold water up to 24 hours porjonto thanda dhori rakhte pare।"},
                "reply": "Smart Bottle (৳850) double-wall vacuum insulation technology thakay hot beverage 12 hours porjonto gorom ebong cold water up to 24 hours porjonto thanda dhori rakhte pare।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 9: tenant_cosmetics_03 (GlowBloom Botanicals) - 3 records
    # -------------------------------------------------------------
    "kz_b4_06118": {
        "scenario": "v_novel_cosmetics_sunscreen_whitecast",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_cosmetics_03", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GlowBloom Botanicals (Cosmetics & Skincare). Brand tone: friendly. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Water-Light SPF 50+ Sunscreen ki deep skin tone e white cast ba chipchipe bhab toiri kore?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Product inquiry", "Skin compatibility"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "না, আমাদের Water-Light SPF 50+ PA++++ Sunscreen (৳1650) হালকা ওয়াটারি জেল টেক্সচারে তৈরি, যা কোনো ধরনের হোয়াইট কাস্ট ছাড়াই দ্রুত ত্বকে মিশে যায় এবং নন-স্টিকি ডিউয়ি ফিনিশ দেয়।"},
                "reply": "না, আমাদের Water-Light SPF 50+ PA++++ Sunscreen (৳1650) হালকা ওয়াটারি জেল টেক্সচারে তৈরি, যা কোনো ধরনের হোয়াইট কাস্ট ছাড়াই দ্রুত ত্বকে মিশে যায় এবং নন-স্টিকি ডিউয়ি ফিনিশ দেয়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_06098": {
        "scenario": "v_novel_cosmetics_niacinamide_am",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_cosmetics_03", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GlowBloom Botanicals (Cosmetics & Skincare). Brand tone: friendly. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Niacinamide 10% + Zinc 1% Serum ki shokal e sunscreen er niche use kora safe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Usage advice", "Routine compatibility"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "অবশ্যই! Niacinamide 10% + Zinc 1% Serum (৳1250) সকালে মুখ ধুয়ে ময়েশ্চারাইজার ও সানস্ক্রিনের নিচে ব্যবহার করা সম্পূর্ণ নিরাপদ। এটি ত্বকের অতিরিক্ত তেল নিয়ন্ত্রণ ও টেক্সচার মসৃণ রাখতে সাহায্য করে।"},
                "reply": "অবশ্যই! Niacinamide 10% + Zinc 1% Serum (৳1250) সকালে মুখ ধুয়ে ময়েশ্চারাইজার ও সানস্ক্রিনের নিচে ব্যবহার করা সম্পূর্ণ নিরাপদ। এটি ত্বকের অতিরিক্ত তেল নিয়ন্ত্রণ ও টেক্সচার মসৃণ রাখতে সাহায্য করে।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b1_00130": {
        "scenario": "v_novel_cosmetics_ceramide_pores",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_cosmetics_03", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for GlowBloom Botanicals (Cosmetics & Skincare). Brand tone: friendly. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Ceramide Barrier Hydration Gel Cream ta ki acne-prone oily skin er pores clog korbe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Product inquiry", "Comedogenic inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ceramide Barrier Hydration Gel Cream (৳1450) lightweight oil-free gel formula e toiri ebong non-comedogenic। Eita pores clog na kore moisture barrier repair kore ebong redness calm kore।"},
                "reply": "Ceramide Barrier Hydration Gel Cream (৳1450) lightweight oil-free gel formula e toiri ebong non-comedogenic। Eita pores clog na kore moisture barrier repair kore ebong redness calm kore।"
            }, ensure_ascii=False)},
            {"role": "user", "content": "Dhaka te delivery charge koto ar return policy ki?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Delivery and policy inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Dhakar moddhe delivery charge ৳70 (24 to 48 hours)। Return policy onujayi unopened ebong intact seal obosthay 3 diner moddhe return facility paben।"},
                "reply": "Dhakar moddhe delivery charge ৳70 (24 to 48 hours)। Return policy onujayi unopened ebong intact seal obosthay 3 diner moddhe return facility paben।"
            }, ensure_ascii=False)}
        ]
    },

    # -------------------------------------------------------------
    # Tenant 10: tenant_furniture_05 (UrbanCraft Furnishings) - 3 records
    # -------------------------------------------------------------
    "kz_b4_06688": {
        "scenario": "v_novel_furniture_lumbar_adjustment",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_furniture_05", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for UrbanCraft Furnishings (Modern Furniture & Ergonomics). Brand tone: authoritative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "ErgoPro High-Back Mesh Chair er lumbar support ki height o depth customize kora jay?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Ergonomic adjustment", "Product inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "জি, ErgoPro High-Back Mesh Chair (৳11500) এ 2D অ্যাডজাস্টেবল লাম্বার সাপোর্ট রয়েছে, যার মাধ্যমে আপনার মেরুদণ্ডের গঠন অনুযায়ী উচ্চতা এবং স্পাইনাল সাপোর্ট সহজেই সমন্বয় করা যায়।"},
                "reply": "জি, ErgoPro High-Back Mesh Chair (৳11500) এ 2D অ্যাডজাস্টেবল লাম্বার সাপোর্ট রয়েছে, যার মাধ্যমে আপনার মেরুদণ্ডের গঠন অনুযায়ী উচ্চতা এবং স্পাইনাল সাপোর্ট সহজেই সমন্বয় করা যায়।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b5_08797": {
        "scenario": "v_novel_furniture_desk_lacquer",
        "language": "banglish",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_furniture_05", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for UrbanCraft Furnishings (Modern Furniture & Ergonomics). Brand tone: authoritative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Nordic Solid Oak Study Desk er surface ki water-resistant protective lacquer kora?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "banglish", "intents": ["Material inquiry", "Wood protection"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "Ji, Nordic Solid Oak Study Desk (৳16800) matte polyurethane heat and moisture resistant clear coat e finish kora, ja daily coffee/water spill theke wood grain ke shurokkha dey।"},
                "reply": "Ji, Nordic Solid Oak Study Desk (৳16800) matte polyurethane heat and moisture resistant clear coat e finish kora, ja daily coffee/water spill theke wood grain ke shurokkha dey।"
            }, ensure_ascii=False)}
        ]
    },
    "kz_b4_06691": {
        "scenario": "v_novel_furniture_assembly_team",
        "language": "mixed",
        "metadata": {"priority": "LOW", "tenant_id": "tenant_furniture_05", "source": "phase5_remediated_novel_val"},
        "messages": [
            {"role": "system", "content": "You are an AI customer service assistant for UrbanCraft Furnishings (Modern Furniture & Ergonomics). Brand tone: authoritative. Currency: BDT (৳). Respond strictly in valid JSON format with keys 'analysis' and 'reply'."},
            {"role": "user", "content": "Study Desk order korle Dhakar moddhe in-room assembly team ki sathe ashe?"},
            {"role": "assistant", "content": json.dumps({
                "analysis": {"language": "mixed", "intents": ["Assembly service inquiry", "Delivery inquiry"], "priority": "LOW", "sentiment": "neutral", "requires_human": False, "escalation_reason": None, "confidence": 0.98, "suggested_response": "জি! ঢাকার ভেতরে ২ থেকে ৩ কার্যদিবসের মধ্যে আমাদের নিজস্ব ডেলিভারি টিম সলিড ওক স্টাডি ডেস্ক পৌঁছে দেওয়ার সাথে সাথে আপনার নির্দিষ্ট রুমে ফ্রি ইন-রুম অ্যাসেম্বলি সম্পন্ন করে দেবে (ডেলিভারি চার্জ ৳৩০০)।"},
                "reply": "জি! ঢাকার ভেতরে ২ থেকে ৩ কার্যদিবসের মধ্যে আমাদের নিজস্ব ডেলিভারি টিম সলিড ওক স্টাডি ডেস্ক পৌঁছে দেওয়ার সাথে সাথে আপনার নির্দিষ্ট রুমে ফ্রি ইন-রুম অ্যাসেম্বলি সম্পন্ন করে দেবে (ডেলিভারি চার্জ ৳৩০০)।"
            }, ensure_ascii=False)}
        ]
    }
}

def execute_replacement():
    print("=" * 70)
    print("KREAZYAI VALIDATION REPLACEMENT EXECUTION")
    print("=" * 70)

    val_records = [json.loads(l) for l in open(VAL_FILE, "r", encoding="utf-8") if l.strip()]
    train_records = [json.loads(l) for l in open(TRAIN_FILE, "r", encoding="utf-8") if l.strip()]

    print(f"[*] Initial Validation Records: {len(val_records)}")
    print(f"[*] Initial Training Records:   {len(train_records)}")
    print(f"[*] Total Replacements Defined: {len(REPLACEMENTS)}")

    assert len(REPLACEMENTS) == 52, f"Expected exactly 52 replacements, got {len(REPLACEMENTS)}"

    replaced_count = 0
    new_val_records = []

    for r in val_records:
        rec_id = r["id"]
        if rec_id in REPLACEMENTS:
            rep = REPLACEMENTS[rec_id]
            updated_record = {
                "id": rec_id,
                "tenant_id": r["tenant_id"],
                "language": rep["language"],
                "scenario": rep["scenario"],
                "messages": rep["messages"],
                "metadata": rep["metadata"]
            }
            new_val_records.append(updated_record)
            replaced_count += 1
        else:
            new_val_records.append(r)

    print(f"[*] Replaced Records in Val:   {replaced_count} / {len(val_records)}")
    assert replaced_count == 52, f"Expected 52 replaced records, got {replaced_count}"

    # Write updated validation split to both paths
    with open(VAL_FILE, "w", encoding="utf-8") as f:
        for r in new_val_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    root_val = BASE_DIR.parent / "pilot_validation.jsonl"
    with open(root_val, "w", encoding="utf-8") as f:
        for r in new_val_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    training_val = BASE_DIR / "pilot_validation.jsonl"
    with open(training_val, "w", encoding="utf-8") as f:
        for r in new_val_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"✅ Successfully wrote 200 updated validation records across all paths.")

if __name__ == "__main__":
    execute_replacement()
