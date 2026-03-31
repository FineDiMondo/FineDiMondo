# 🌟 Fine Di Mondo - Progetto Integrazione & Social

Benvenuto Claude Cowork. Questo progetto è il cuore tecnologico dell'associazione **Fine di Mondo APS**. Il sistema si occupa di automatizzare la gestione degli eventi, l'analisi degli artisti tramite AI e l'integrazione con i canali social (Facebook/Instagram/WhatsApp).

## 🏗️ Architettura Attuale
Il sistema è diviso in diversi moduli orchestrati tramite Python e interfacciati con Google Cloud:

1.  **FreedomRun Core**: Gestione sincronizzazione Google Drive e integrazione con Vertex AI (Gemini).
2.  **Social Importer**: Script per il download massivo di eventi da pagine Facebook.
3.  **AI Artist Extractor**: Motore basato su Gemini 2.5 Flash che analizza le descrizioni degli eventi per estrarre band, collettivi e link social (Instagram, Spotify, ecc.).
4.  **Poster Manager**: Sistema di archiviazione locale delle locandine degli eventi.

## 📊 Stato del Database (PostgreSQL su GCloud)
Abbiamo appena ricostruito e popolato il database `kyuss_retro` con i seguenti dati:
*   **Eventi**: 216 eventi storici estratti dalle pagine collegate.
*   **Locandine**: 216 immagini scaricate e salvate localmente in `FreedomRun/posters/`.
*   **Entità (Band/Artisti)**: 413 entità identificate con oltre 200 link social diretti.
*   **Mapping**: Ogni evento è collegato ai suoi performer e organizzatori.

## 📁 Struttura Tabelle Principali
*   `venue_events`: Dettagli degli eventi (date, descrizioni, ticket).
*   `entities`: Anagrafica band, collettivi e associazioni con link social.
*   `event_posters`: Riferimenti alle immagini originali e ai file locali.
*   `event_entity_mapping`: Collegamenti tra performer ed eventi.

## 🛠️ Prossimi Obiettivi
*   Completare l'integrazione con WhatsApp per il recupero dei messaggi storici.
*   Sviluppare il frontend per la visualizzazione dell'archivio eventi e artisti.
*   Automatizzare la pubblicazione e il cross-posting tra le piattaforme.
