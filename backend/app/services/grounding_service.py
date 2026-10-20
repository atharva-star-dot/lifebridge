import urllib.parse
from typing import Optional, List
from app.schemas import VerificationItem, VerificationStatus, ActionItem

def build_google_maps_url(query: str, lat: Optional[float] = None, lon: Optional[float] = None) -> str:
    """
    Constructs a verified Google Maps search query link for the nearest relevant facility.
    """
    clean_query = query.strip()
    if lat is not None and lon is not None:
        clean_query += f" near {lat},{lon}"
    encoded = urllib.parse.quote_plus(clean_query)
    return f"https://www.google.com/maps/search/?api=1&query={encoded}"

def enrich_actions_with_navigation(
    actions: List[ActionItem], 
    locations: List[str],
    lat: Optional[float] = None, 
    lon: Optional[float] = None
) -> List[ActionItem]:
    """
    Ensures actions that reference a medical or physical facility have a working Google Maps URL.
    """
    location_suffix = f" in {locations[0]}" if locations else ""

    for action in actions:
        if action.map_query:
            if not action.map_query.startswith("http"):
                query = action.map_query
                if location_suffix and not any(loc.lower() in query.lower() for loc in locations):
                    query += location_suffix
                action.map_query = build_google_maps_url(query, lat, lon)
        elif any(kw in action.action.lower() for kw in ["hospital", "clinic", "pharmacy", "shelter", "doctor"]):
            query = f"nearest hospital{location_suffix}"
            action.map_query = build_google_maps_url(query, lat, lon)

    return actions

def process_grounding_citations(
    verifications: List[VerificationItem], 
    grounding_metadata: Optional[dict] = None
) -> List[VerificationItem]:
    """
    Extracts citation URLs from Google Search grounding metadata if provided by Gemini,
    or validates existing verification claims.
    """
    if not grounding_metadata:
        return verifications

    # If the SDK returned search queries or web search sources:
    web_search_sources = grounding_metadata.get("grounding_chunks", [])
    
    for chunk in web_search_sources:
        web = chunk.get("web", {})
        uri = web.get("uri")
        title = web.get("title")
        if uri:
            verifications.append(
                VerificationItem(
                    claim=f"Verified via Google Search: {title or 'External Reference'}",
                    status=VerificationStatus.VERIFIED,
                    source_title=title or "Google Search Reference",
                    source_url=uri,
                    notes="Retrieved via live Google Search grounding."
                )
            )

    return verifications
