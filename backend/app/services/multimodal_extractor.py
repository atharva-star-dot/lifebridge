import io
from typing import Optional, Tuple
from pypdf import PdfReader
from PIL import Image

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text content from a PDF document safely.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                extracted_pages.append(f"--- Page {i+1} ---\n{text.strip()}")
        return "\n\n".join(extracted_pages)
    except Exception as e:
        return f"[PDF parsing note: Could not extract digital text: {str(e)}]"

def validate_image(file_bytes: bytes) -> Tuple[bool, Optional[str]]:
    """
    Validates image bytes using Pillow and returns (is_valid, mime_type).
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        format_lower = (img.format or "").lower()
        mime_map = {
            "jpeg": "image/jpeg",
            "jpg": "image/jpeg",
            "png": "image/png",
            "webp": "image/webp",
            "gif": "image/gif"
        }
        return True, mime_map.get(format_lower, "image/jpeg")
    except Exception:
        return False, None
