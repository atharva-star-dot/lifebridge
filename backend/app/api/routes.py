from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.config import GEMINI_API_KEY, DEFAULT_MODEL
from app.schemas import LifeBridgeAnalysis, HealthResponse
from app.services.gemini_service import analyze_input
from app.services.multimodal_extractor import extract_text_from_pdf, validate_image
from app.services.demo_data import DEMO_SCENARIOS

router = APIRouter(prefix="/api")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        gemini_configured=bool(GEMINI_API_KEY and len(GEMINI_API_KEY.strip()) > 5),
        model=DEFAULT_MODEL
    )

@router.get("/demos")
async def get_demos():
    return {
        "scenarios": [
            {
                "id": data["id"],
                "title": data["title"],
                "description": data["description"],
                "sample_text": data["sample_text"],
                "data": data["precomputed"].model_dump()
            }
            for data in DEMO_SCENARIOS.values()
        ]
    }

@router.post("/analyze", response_model=LifeBridgeAnalysis)
async def analyze_endpoint(
    text: Optional[str] = Form(None),
    language: str = Form("en"),
    user_latitude: Optional[float] = Form(None),
    user_longitude: Optional[float] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Unified multimodal analysis endpoint.
    Accepts raw text, speech transcription, PDF clinical files, images, or audio.
    """
    full_text = (text or "").strip()
    file_bytes = None
    mime_type = None

    if file:
        file_bytes = await file.read()
        filename = (file.filename or "").lower()
        content_type = file.content_type or ""

        # PDF processing
        if filename.endswith(".pdf") or "pdf" in content_type:
            pdf_extracted = extract_text_from_pdf(file_bytes)
            full_text = f"{full_text}\n\n[Extracted from uploaded document '{file.filename}']:\n{pdf_extracted}".strip()
            # Still pass bytes for potential Gemini document vision
            mime_type = "application/pdf"
        # Image processing
        elif any(filename.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"]) or "image" in content_type:
            is_valid, detected_mime = validate_image(file_bytes)
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid or corrupt image uploaded.")
            mime_type = detected_mime or "image/jpeg"
        # Audio processing
        elif any(filename.endswith(ext) for ext in [".mp3", ".wav", ".webm", ".m4a", ".ogg"]) or "audio" in content_type:
            mime_type = content_type or "audio/webm"
        else:
            mime_type = content_type or "application/octet-stream"

    if not full_text and not file_bytes:
        raise HTTPException(
            status_code=400, 
            detail="No input provided. Please provide text, record audio, or upload a document/image."
        )

    try:
        analysis = analyze_input(
            text=full_text,
            file_bytes=file_bytes,
            mime_type=mime_type,
            language=language,
            user_lat=user_latitude,
            user_lon=user_longitude
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis processing error: {str(e)}")
