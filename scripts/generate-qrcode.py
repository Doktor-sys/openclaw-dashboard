#!/usr/bin/env python3
"""
QR Code Generator für OpenClaw Dashboard
Mit Logo-Integration
"""

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image
import sys

DASHBOARD_URL = "https://openclaw.35-195-246-45.nip.io"
OUTPUT_FILE = "openclaw-qrcode.png"
LOGO_FILE = "logo.png"  # Optional: Eigenes Logo einfügen

def generate_qrcode(url, output, logo_path=None):
    """QR Code mit oder ohne Logo erstellen"""
    
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    
    qr.add_data(url)
    qr.make(fit=True)
    
    if logo_path:
        try:
            logo = Image.open(logo_path)
            logo = logo.convert('RGBA')
            
            img = qr.make_image(
                image_factory=StyledPilImage,
                module_drawer=RoundedModuleDrawer(),
                color_mask=SolidFillColorMask(back_color=(255, 255, 255), front_color=(0, 0, 0)),
                embeded_image_path=logo_path
            )
        except FileNotFoundError:
            print(f"Logo nicht gefunden: {logo_path}")
            print("Erstelle QR Code ohne Logo...")
            img = qr.make_image(image_factory=StyledPilImage)
    else:
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=SolidFillColorMask(back_color=(255, 255, 255), front_color=(0, 0, 0))
        )
    
    img.save(output)
    print(f"QR Code erstellt: {output}")
    print(f"URL: {url}")

if __name__ == "__main__":
    logo = LOGO_FILE if len(sys.argv) < 2 else sys.argv[1]
    output = OUTPUT_FILE if len(sys.argv) < 3 else sys.argv[2]
    url = DASHBOARD_URL if len(sys.argv) < 4 else sys.argv[3]
    
    generate_qrcode(url, output, logo if logo != "none" else None)
