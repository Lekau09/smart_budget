"""
Generate a 1,000,000 row SMS transaction dataset for Lesotho/Southern Africa banks.
Categories: Food, Groceries, Transport, Entertainment, Health, Utilities, Shopping, Other
Banks: FNB, Nedbank, Standard Lesotho Bank, Postbank, M-Pesa
"""

import random
import pandas as pd
import re
from datetime import datetime, timedelta

random.seed(42)

# ─────────────────────────────────────────────────────────────
# STORE → CATEGORY MAPPINGS (researched for Southern Africa)
# ─────────────────────────────────────────────────────────────

STORES = {
    "Food": [
        # Fast Food Chains
        "KFC", "McDonald's", "Nandos", "Steers", "Debonairs Pizza",
        "Hungry Lion", "Roman's Pizza", "Chicken Licken", "Wimpy", "Galito's",
        "Ocean Basket", "Fishaways", "Spur", "Panarottis", "John Dory's",
        "Mugg & Bean", "Wimpy Maseru", "Taste Holdings", "Doppio Zero",
        "Burger King", "Subway", "Pizza Hut", "Barcelos", "Cattle Baron",
        "Mike's Kitchen", "Black Steer", "Sherpa's", "Panarotti's",
        "King Pie", "Milky Lane", "Baskin Robbins",
        # Local Lesotho Restaurants & Eateries
        "Lekhalong Restaurant",
        "Maseru Club", "Avani Maseru Hotel", "Lancers Inn Restaurant",
        "Kick 4 Life Cafe", "Lesotho Sun Restaurant", "Qoaling Grill",
        "Ha Tsolo Grill", "Mafeteng Diner", "Mohale Lodge Restaurant",
        "Maluti Mountain Cafe", "Teyateyaneng Restaurant",
        "Maputsoe Eatery", "Hlotse Grill House", "Butha-Buthe Diner",
        "Semonkong Lodge Restaurant", "Morija Cafe",
        "Pizza Palace Maseru", "Maseru Grill", "Corner Cafe Maseru",
        "Bloemfontein Steakhouse", "Ladybrand Grill",
        "Ficksburg Restaurant", "Bethlehem Diner",
        # Coffee Shops
        "Vida e Caffe", "Seattle Coffee", "Mugg Bean Express",
        "Bootlegger Coffee", "Father Coffee", "Bean There",
        # Bars & Pubs
        "Catz Pyjamas", "Jolly Roger", "Tiger's Milk", "Altitude",
        "The Grand", "Barleycorn", "Iron Fist Bar","Black Lounge Night C", "Hotspot",
    ],

    "Groceries": [
        # Major Chains
        "Shoprite", "Pick n Pay", "Checkers", "Spar", "Boxer",
        "Usave", "OK Grocer", "Cambridge Food", "Food Lovers Market",
        "Woolworths Food", "Checkers Hyper", "Pick n Pay Hyper",
        "Makro Food", "Fruit & Veg City", "Fresh Stop",
        # Lesotho Specific
        "Shoprite Maseru", "Shoprite Ladybrand", "Shoprite Mafeteng",
        "Shoprite Hlotse", "Shoprite Mohale's Hoek",
        "Pick n Pay Maseru Mall", "Spar Maseru", "Spar Ha Thetsane",
        "Spar Teyateyaneng", "Usave Ha Foso", "Usave Ha Abia",
        "Usave Qoaling", "Boxer Maseru", "Boxer Mafeteng",
        "OK Grocer Maseru", "Cambridge Food Maseru",
        "Pioneer Mall Groceries", "Lesotho Food Market",
        "Ha Rants'o Mini Market", "Qoaling Supermarket",
        "Mazenod General Store", "Morija Store",
        "Teyateyaneng Market", "Butha-Buthe Spar",
        "Mokhotlong General Store", "Qacha's Nek Groceries",
        "Thaba-Tseka General Store", "Semonkong Store",
        # Surrounding SA Border Towns
        "Shoprite Ladybrand", "Pick n Pay Ficksburg",
        "Spar Bethlehem", "Checkers Bloemfontein",
        "Pick n Pay Welkom", "Shoprite Aliwal North",
        "Spar Sterkspruit", "OK Grocer Zastron",
    ],

    "Transport": [
        # Fuel Stations
        "Total", "Total Energies", "Engen", "Shell", "BP",
        "Caltex", "Sasol", "Astron Energy",
        "Total Maseru", "Total Ha Thetsane", "Total Qoaling",
        "Engen Maseru", "Engen Mafeteng", "Engen Hlotse",
        "Shell Maseru", "Shell Ha Thetsane", "BP Maseru",
        "Caltex Maseru", "Sasol Maseru",
        "Tholo Energy", "Lesotho Fuel Depot",
        "Total Ladybrand", "Engen Ficksburg", "Shell Bethlehem",
        "BP Bloemfontein", "Total Butha-Buthe",
        "Engen Mohale's Hoek", "Total Mafeteng",
        "Shell Teyateyaneng", "BP Hlotse",
        # Transport Services
        "Uber", "Bolt", "InDriver", "Lesotho Taxis",
        "Maseru Cab Service", "Airport Shuttle",
        "Bus Ticket Maseru", "Intercape", "Greyhound",
        "City to City Bus", "SA Roadlink",
        # Vehicle Services
        "Motus Workshop", "Toyota Lesotho", "VW Maseru",
        "Hyundai Maseru", "Ford Maseru Service",
        "Midas Auto Parts", "Repco", "Supaquick",
        "Hi-Q Tyres", "Tiger Wheel & Tyre",
        "Auto & General", "Tracker Fitment",
    ],

    "Entertainment": [
        # Cinemas
        "Nu Metro", "Ster Kinekor", "Cinema Maseru",
        "Nu Metro Maseru Mall", "Ster Kinekor Bloemfontein",
        # Streaming
        "Netflix", "Showmax", "DSTV", "DSTV Premium",
        "Amazon Prime", "Apple iTunes", "Google Play",
        "Spotify", "YouTube Premium", "Disney Plus",
        "Canal Plus", "MultiChoice",
        # Bars Clubs Lesotho
        "Black Lounge Night C", "Hotspot", "Club Illusions",
        "Mahareng Night Club", "Eclipse Club Maseru",
        "Lesotho Sun Casino", "Avani Casino",
        "Maseru Bowling Club", "Royal Lesotho Golf Club",
        "Ha Matela Leisure", "Quthing Entertainment",
        "Kick 4 Life Events", "Morija Arts Festival",
        # Sports
        "Sports Science Institute", "Virgin Active",
        "Planet Fitness", "Planet Fitness Maseru",
        "Gym Company", "Lesotho Fitness Centre",
        "Maseru Sports Club", "Ha Abia Sports Complex",
        # Games & Events
        "Roblox", "Steam Games", "PlayStation Store",
        "Xbox Game Pass", "Apple App Store",
        "Computicket", "Webtickets", "Ticketpros",
    ],

    "Health": [
        # Pharmacies
        "Clicks", "Dischem", "Medirite", "Clicks Maseru",
        "Dischem Maseru", "Clicks Pioneer Mall",
        "Medicare Pharmacy Maseru", "Lesotho Pharmacy",
        "Ha Thetsane Pharmacy", "Qoaling Pharmacy",
        "Mafeteng Pharmacy", "Hlotse Pharmacy",
        "Pioneer Pharmacy", "Alpha Pharmacy Maseru",
        "St Joseph's Pharmacy", "Mokhotlong Pharmacy",
        "Qacha's Nek Pharmacy", "Butha-Buthe Pharmacy",
        # Hospitals & Clinics
        "Lesotho Boston Medical", "Maluti Adventist Hospital",
        "Scott Hospital", "St Joseph's Hospital",
        "Motebang Hospital", "Queen Elizabeth II Hospital",
        "SOS Medical Centre", "NetCare Maseru",
        "Muel Medical Centre", "Ha Thetsane Clinic",
        "Qoaling Health Centre", "Mazenod Clinic",
        "Berea Hospital", "CHAL Hospital",
        # Optical & Dental
        "Spec Savers Maseru", "National Opticians",
        "Lesotho Dental Centre", "Maseru Dental Practice",
        # Wellness
        "Wellness Warehouse", "Faithful to Nature",
        "Dischem Beauty", "Clicks Wellness",
    ],

    "Utilities": [
        # Electricity & Water
        "LEC", "LEWA", "Lesotho Electricity Company",
        "Lesotho Water Authority", "WASA",
        "Prepaid Electricity Maseru", "LEC Token",
        "Municipality Maseru", "Maseru City Council",
        "Teyateyaneng Municipality", "Mafeteng Municipality",
        "Hlotse Town Council", "Mohale's Hoek Municipality",
        "Quthing Municipality", "Butha-Buthe Municipality",
        # Telecommunications Bills
        "Vodacom Bill", "Econet Bill", "Telecoms Lesotho",
        "ADSL Bill", "Fibre Internet", "MTN Bill",
        "Lesotho Telecom", "Airtel Bill",
        # Other Utilities
        "Refuse Removal Maseru", "Rates Maseru",
        "Property Rates", "Body Corporate",
        "Insurance Payment", "Hollard Insurance",
        "Old Mutual Premium", "Metropolitan Premium",
        "Liberty Life Premium", "Momentum Premium",
        "Discovery Premium",
    ],

    "Shopping": [
        # Clothing & Fashion
        "Edgars", "Jet", "Ackermans", "Mr Price",
        "Pep Stores", "Foschini", "Truworths", "Exact",
        "Identity", "Relay Jeans", "Totalsports",
        "Sportscene", "Sneaker Factory", "Studio 88",
        "Footgear", "Footgear (pty)ltd", "Shoe City",
        "Bata Shoes", "Rage Shoes", "Queenspark",
        "Edgars Maseru", "Jet Maseru", "Mr Price Maseru",
        "Pep Maseru", "Truworths Maseru Mall",
        "Ackermans Maseru", "Foschini Maseru Mall",
        "Mr Price Sport", "Markham", "Fabiani",
        "G-Star Raw", "Levi's Store", "Cotton On",
        "Zara SA", "H&M South Africa",
        # Electronics & Tech
        "Game", "Hi Store", "Incredible Connection",
        "iStore", "Samsung Store", "Huawei Store",
        "Vodacom Shop", "MTN Shop", "Econet Shop",
        "Makro Electronics", "Builders Warehouse",
        # Home & Hardware
        "Builders Express", "Cashbuild",
        "Maseru Hardware", "Leroy Merlin",
        "Plastic Land", "Mr Price Home",
        "@Home", "Boardmans", "Sheet Street",
        "Bed Bath & Living",
        # Online Shopping
        "Takealot", "Amazon", "Superbalist",
        "Zando", "Bash.com", "Shein",
        # Books & Stationery
        "CNA", "Exclusive Books", "Waltons",
        "Lesotho Bookshop", "NUL Bookshop",
    ],

    "Subscriptions": [
        # Streaming Video
        "Netflix", "Showmax", "DSTV", "DSTV Premium",
        "MultiChoice", "Canal Plus", "Amazon Prime Video",
        "Disney Plus", "Apple TV Plus", "Paramount Plus",
        "DSTV Compact", "DSTV Access", "DSTV Family",
        # Music & Audio
        "Spotify", "Apple Music", "YouTube Premium",
        "Deezer", "Tidal", "Amazon Music",
        # Gaming
        "Xbox Game Pass", "PlayStation Plus", "EA Play",
        "Nintendo Switch Online", "Apple Arcade",
        # Software & Cloud
        "Microsoft 365", "Google One", "iCloud Storage",
        "Dropbox", "Adobe Creative Cloud", "Canva Pro",
        "NordVPN", "ExpressVPN",
        # News & Reading
        "News24 Premium", "Daily Maverick", "Kindle Unlimited",
        # Health & Fitness Apps
        "MyFitnessPal Premium", "Calm App", "Headspace",
        # Local
        "Vodacom Red Plan", "MTN Premium Plan", "Econet Bundle",
    ],

    "Other": [
        # ATM & Cash
        "ATM FNB", "ATM Nedbank", "ATM Standard Bank",
        "ATM Postbank", "Cash Withdrawal",
        # Unknown/Ambiguous Local Stores
        "Footgear (pty)ltd", "General Dealer Maseru",
        "Ha Foso Trading", "Ha Abia Store",
        "Qoaling General", "Mazenod Traders",
        "Pioneer Traders", "Maseru General Store",
        "Thaba Bosiu Traders", "Ha Tsolo Traders",
        "Roma Traders", "Morija General",
        # Services
        "Lesotho Revenue Services", "Ministry of Finance",
        "Home Affairs Lesotho", "Government Services",
        "NUL Fees", "Limkokwing Fees", "Hotel School Fees",
        "NSDP Payment", "Lesotho College Payment",
        # Salons & Beauty
        "Hair Salon Maseru", "Nails & Beauty",
        "Maseru Beauty Spa", "Qoaling Salon",
        "Relaxer Studio", "Braids & More",
        # Misc
        "Western Union", "MoneyGram",
        "Lesotho Post Office", "DHL Maseru",
        "FedEx Maseru", "Pargo Pickup",
    ],
}

# ─────────────────────────────────────────────────────────────
# BANK SMS FORMAT TEMPLATES
# ─────────────────────────────────────────────────────────────

def rand_date():
    base = datetime(2023, 1, 1)
    delta = timedelta(days=random.randint(0, 730), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    d = base + delta
    return d.strftime("%d%b %H:%M").lstrip("0")

def rand_amount(lo=20, hi=8000):
    return round(random.uniform(lo, hi), 2)

def rand_balance(spent):
    return round(random.uniform(10, 15000), 2)

def rand_account():
    return f"{''.join([str(random.randint(0,9)) for _ in range(6)])}"

def rand_card():
    return f"{random.randint(1000,9999)}"

def make_fnb(store, amount, balance, account, card, date):
    templates = [
        f"FNB:-) M{amount:.2f} reserved for purchase @ {store} from Smart Account..{account} using card..{card}. Avail M{balance:.2f}.  {date}",
        f"FNB:-) M{amount:.2f} reserved for purchase @ {store} from Smart Account..{account} on {date}. Available balance M{balance:.2f}.",
    ]
    return random.choice(templates)

def make_fnb_atm(amount, balance, account, card, date):
    templates = [
        f"FNB:-) M{amount:.2f} withdrawn from Smart Account..{account} @ Opercent ATM. {date}",
        f"FNB:-) M{amount:.2f} ATM cash withdrawal from Smart Account..{account} using card..{card}. Avail M{balance:.2f}.  {date}",
        f"FNB:-) M{amount:.2f} withdrawn from Smart Account..{account} @ Standard ATM. {date}",
    ]
    return random.choice(templates)

def make_nedbank(store, amount, balance, account, date):
    return (
        f"Nedbank: M{amount:.2f} debited from acc ..{account} at {store}. "
        f"Bal: M{balance:.2f}. {date}"
    )

def make_nedbank_atm(amount, balance, account, date):
    return (
        f"Nedbank: M{amount:.2f} ATM withdrawal acc ..{account}. "
        f"Bal: M{balance:.2f}. {date}"
    )

def make_standard(store, amount, balance, account, date):
    xx_acc = f"XX{account[-4:]}"
    templates = [
        f"ZAR {amount:.2f} has been reserved from Acc: {xx_acc} for purchase via POS {store} on {date}. Available balance is LSL {balance:.2f}",
        f"Your Acc {xx_acc} has been debited with LSL {amount:.2f} on {date}. Ref : POS {store}. Available balance is LSL {balance:.2f}. Helpline: 266 22322424",
        f"StanLib: M{amount:.2f} purchase at {store}. Acc ..{account}. Avail bal: M{balance:.2f}. {date}",
    ]
    return random.choice(templates)

def make_standard_atm(amount, balance, account, date):
    xx_acc = f"XX{account[-4:]}"
    templates = [
        f"Your Acc {xx_acc} has been debited with LSL {amount:.2f} on {date}. Ref : Pay 2wallet ECO. Available balance is LSL {balance:.2f}. Helpline: 266 22322424",
        f"StanLib: M{amount:.2f} ATM cash withdrawal. Acc ..{account}. Avail bal: M{balance:.2f}. {date}",
    ]
    return random.choice(templates)

def make_postbank(store, amount, balance, date):
    return (
        f"Postbank: M{amount:.2f} deducted. Purchase at {store}. "
        f"Bal M{balance:.2f}. {date}"
    )

def make_postbank_atm(amount, balance, date):
    return (
        f"Postbank: M{amount:.2f} deducted. ATM withdrawal. "
        f"Bal M{balance:.2f}. {date}"
    )

def make_mpesa_payment(store, amount, balance, date):
    code = f"{random.randint(10000,99999)}"
    templates = [
        f"Give M{amount:.2f} cash to {store}. New M-Pesa balance M{balance:.2f}. {date}",
        f"M{amount:.2f} sent to {code} - {store} Merchant Payment. Balance M{balance:.2f}. {date}",
        f"You have paid M{amount:.2f} to {code}- {store} for Merchant Payment. Balance M{balance:.2f}. {date}",
        f"M-PESA: M{amount:.2f} paid to {store}. Ref: MPESA{random.randint(100000,999999)}. Balance M{balance:.2f}. {date}",
    ]
    return random.choice(templates)

def make_mpesa_transfer(amount, balance, date):
    number = f"2675{random.randint(1000000,9999999)}"
    return (
        f"M-PESA: M{amount:.2f} sent to {number}. "
        f"Your M-PESA balance is M{balance:.2f}. {date}"
    )

def make_mpesa_withdrawal(amount, balance, date):
    agent = random.choice(["MTN General Cafe", "Econet Agent", "Vodacom Shop", "M-Pesa Agent"])
    code = f"{random.randint(1000,9999)}"
    templates = [
        f"Transact ID {random.randint(1000000,9999999)} Withdraw M{amount:.2f} from {code} - {agent}. New balance M{balance:.2f}. {date}",
        f"M-PESA: M{amount:.2f} withdrawn at agent. Balance M{balance:.2f}. {date}",
    ]
    return random.choice(templates)

def make_ecocash(store, amount, balance, date):
    code = f"{random.randint(10000,99999)}"
    return f"You have paid M{amount:.2f} to {code}- {store} for Merchant Payment. Approval Code: {random.randint(100000,999999)}. New balance M{balance:.2f}."

def make_ecocash_withdrawal(amount, balance, date):
    agent = random.choice(["NeoLekoekoe Leribe", "Ecocash Agent Maseru", "Mapoteng Agent"])
    code = f"{random.randint(10000,99999)}"
    return f"Ecocash: CashOut Confirmation: M {amount:.2f} from {code}-{agent}. Approval Code: {random.randint(100000,999999)}."

# ─────────────────────────────────────────────────────────────
# DATASET GENERATOR
# ─────────────────────────────────────────────────────────────

BANK_FORMATS = ["FNB", "Nedbank", "Standard", "Postbank", "M-Pesa", "Ecocash"]

# Weight categories so dataset is realistic
CATEGORY_WEIGHTS = {
    "Groceries":     0.20,
    "Food":          0.17,
    "Transport":     0.13,
    "Shopping":      0.11,
    "Entertainment": 0.08,
    "Health":        0.07,
    "Utilities":     0.07,
    "Subscriptions": 0.09,
    "Other":         0.08,
}

def generate_row():
    # Pick category by weight
    category = random.choices(
        list(CATEGORY_WEIGHTS.keys()),
        weights=list(CATEGORY_WEIGHTS.values())
    )[0]

    store = random.choice(STORES[category])
    amount = rand_amount()
    balance = rand_balance(amount)
    account = rand_account()
    card = rand_card()
    date = rand_date()
    bank = random.choice(BANK_FORMATS)

    # ATM / Cash Withdrawal logic
    is_atm = category == "Other" and "ATM" in store

    if bank == "FNB":
        if is_atm:
            sms = make_fnb_atm(amount, balance, account, card, date)
            category = "Other"
        else:
            sms = make_fnb(store, amount, balance, account, card, date)
    elif bank == "Nedbank":
        if is_atm:
            sms = make_nedbank_atm(amount, balance, account, date)
            category = "Other"
        else:
            sms = make_nedbank(store, amount, balance, account, date)
    elif bank == "Standard":
        if is_atm:
            sms = make_standard_atm(amount, balance, account, date)
            category = "Other"
        else:
            sms = make_standard(store, amount, balance, account, date)
    elif bank == "Postbank":
        if is_atm:
            sms = make_postbank_atm(amount, balance, date)
            category = "Other"
        else:
            sms = make_postbank(store, amount, balance, date)
    elif bank == "Ecocash":
        r = random.random()
        if r < 0.65:
            sms = make_ecocash(store, amount, balance, date)
        else:
            sms = make_ecocash_withdrawal(amount, balance, date)
            category = "Other"
    else:  # M-Pesa
        r = random.random()
        if r < 0.6:
            sms = make_mpesa_payment(store, amount, balance, date)
        elif r < 0.8:
            sms = make_mpesa_transfer(amount, balance, date)
            category = "Other"
        else:
            sms = make_mpesa_withdrawal(amount, balance, date)
            category = "Other"

    return {"sms": sms, "store": store, "bank": bank, "category": category,
            "amount": amount, "balance": balance}


if __name__ == "__main__":
    import os
    n = int(os.environ.get("ROWS", "1000000"))
    out = os.environ.get("OUT", os.path.join(os.path.dirname(__file__), "sms_dataset_v2.csv"))
    print(f"Generating {n:,} SMS rows -> {out}")
    rows = [generate_row() for _ in range(n)]
    df = pd.DataFrame(rows)
    df.to_csv(out, index=False)
    print(f"Done! Shape: {df.shape}")
    print(df["category"].value_counts())
    print("\nSample rows:")
    print(df[["sms","category"]].head(10).to_string())
