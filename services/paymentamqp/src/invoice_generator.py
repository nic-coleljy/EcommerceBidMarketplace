import requests
import uuid

from datetime import date
from os import environ

INVOICE_GENERATOR_API_KEY = environ.get("invoice_api_key")
TEMPLATE_ID = environ.get("template_id")


def generate_invoice(name, email, item_name, price):
    data = {
        "receiver_name": name,
        "receiver_email_address": email,
        "invoice_no": str(uuid.uuid4()),
        "date": str(date.today()),
        "item_name": item_name,
        "unit_price": float(price),
        "unit": 1,
    }

    response = requests.post(
        f"https://api.apitemplate.io/v1/create?template_id={TEMPLATE_ID}",
        headers={"X-API-KEY": f"{INVOICE_GENERATOR_API_KEY}"},
        json=data,
    )

    if response.status_code != 200:
        return None

    resp = response.json()

    return resp["download_url"]
