from twilio.rest import Client
from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
acc_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
whatsapp_from = os.getenv("TWILIO_WHATSAPP_FROM")
whatsapp_to = os.getenv("TWILIO_WHATSAPP_TO")

client = Client(acc_sid ,auth_token)


def sendMessageTest(order_id:int):
    message = client.messages.create(
    from_=whatsapp_from,
    body=f"""Your order with id {order_id} has been submitted.
    """,
    to=whatsapp_to
    )

def sendMessage(order, phone_num: str, db):
    from app.models.menu import Item

    lines = []
    for oi in order.order_items:
        item = db.query(Item).filter(Item.id == oi.item_id).first()
        item_name = item.name if item else f"Item #{oi.item_id}"
        subtotal = round(oi.quantity * oi.unit_price, 2)
        lines.append(f"• {item_name} x{oi.quantity} — €{subtotal:.2f}")

    items_text = "\n".join(lines)
    flight_date_str = order.flight_date.strftime("%d %b %Y %H:%M") if order.flight_date else "N/A"
    to_number = phone_num if phone_num.startswith("whatsapp:") else f"whatsapp:{phone_num}"

    body = (
        f"✈️ SkyGourmet Order Confirmed!\n\n"
        f"Order #{order.id}\n"
        f"Aircraft: {order.tail_number}\n"
        f"Flight Date: {flight_date_str}\n"
        f"Passengers: {order.passenger_count}\n\n"
        f"Items:\n{items_text}\n\n"
        f"Total: €{order.total_amount:.2f}\n\n"
        f"Thank you for choosing SkyGourmet!"
    )

    client.messages.create(
        from_=whatsapp_from,
        body=body,
        to=to_number,
    )