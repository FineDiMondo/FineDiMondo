from google.cloud import aiplatform
import json
from app.config import settings


class VertexAIService:
    """Servizio per l'integrazione con Vertex AI (Gemini)"""

    def __init__(self):
        self.project_id = settings.VERTEX_AI_PROJECT
        self.location = settings.VERTEX_AI_LOCATION
        self.model_id = settings.VERTEX_AI_MODEL

    def analyze_event_for_artists(self, event_description: str, event_name: str) -> dict:
        """
        Usa Gemini per analizzare una descrizione evento ed estrarre artisti/band.

        Returns:
            {
                "artists": [
                    {
                        "name": "Artist Name",
                        "type": "band|artist|collective",
                        "genres": ["genre1", "genre2"],
                        "confidence": 0.95
                    }
                ],
                "keywords": ["keyword1", "keyword2"]
            }
        """
        prompt = f"""
Analizza il seguente evento musicale e estrai gli artisti/band menzionati.

NOME EVENTO: {event_name}

DESCRIZIONE EVENTO:
{event_description}

Per ogni artista identificato, fornisci:
1. Nome esatto dell'artista/band
2. Tipo (band, artista solista, collettivo, etc.)
3. Generi musicali (se menzionati)
4. Livello di confidenza (0-1)

Rispondi in formato JSON:
{{
    "artists": [
        {{
            "name": "...",
            "type": "band|artist|collective|organizer",
            "genres": ["genre1", "genre2"],
            "confidence": 0.95
        }}
    ],
    "keywords": ["keyword1", "keyword2", "..."],
    "summary": "breve riassunto dell'evento"
}}
"""

        try:
            model = aiplatform.GenerativeModel(
                model_name=self.model_id,
                project=self.project_id,
                location=self.location
            )

            response = model.generate_content(prompt)

            # Parse JSON response
            response_text = response.text
            # Estrai JSON dal testo (rimuove markdown code blocks se presenti)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            result = json.loads(response_text)
            return result

        except Exception as e:
            print(f"Error analyzing event with Gemini: {str(e)}")
            return {
                "artists": [],
                "keywords": [],
                "summary": f"Error: {str(e)}"
            }

    def analyze_text_for_social_links(self, text: str) -> dict:
        """
        Estrae link social da un testo generico.

        Returns:
            {
                "instagram": "@handle",
                "spotify": "url",
                "facebook": "url",
                "youtube": "url",
                "website": "url"
            }
        """
        prompt = f"""
Estrai i link social dal testo seguente. Cerca per:
- Instagram (@handle oppure instagram.com/...)
- Spotify (spotify.com/...)
- Facebook (facebook.com/...)
- YouTube (youtube.com/... o youtu.be/...)
- Website/Blog personale

TESTO:
{text}

Rispondi in formato JSON:
{{
    "instagram": "@handle oppure null",
    "spotify": "url oppure null",
    "facebook": "url oppure null",
    "youtube": "url oppure null",
    "website": "url oppure null"
}}
"""

        try:
            model = aiplatform.GenerativeModel(
                model_name=self.model_id,
                project=self.project_id,
                location=self.location
            )

            response = model.generate_content(prompt)
            response_text = response.text

            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            result = json.loads(response_text)
            return result

        except Exception as e:
            print(f"Error extracting social links with Gemini: {str(e)}")
            return {
                "instagram": None,
                "spotify": None,
                "facebook": None,
                "youtube": None,
                "website": None
            }


# Singleton instance
vertex_ai_service = VertexAIService()
