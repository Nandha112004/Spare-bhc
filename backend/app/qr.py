import qrcode
import io
import base64

def generate_qr_base64(data: str) -> str:
    """Generate QR code PNG as base64 data URI"""
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64}"

def generate_exchange_qr(exchange_id: int) -> str:
    payload = f"SPARE-EXCHANGE-{exchange_id}"
    return generate_qr_base64(payload)
