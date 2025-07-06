# example.py
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import play
import base64
import os
import wave

load_dotenv()

elevenlabs = ElevenLabs(
  api_key="sk_0607b9ed6afbfe1a44d8abac6cc9a2abcc96951e34988325",
)

voices = elevenlabs.text_to_voice.design(
    model_id="eleven_multilingual_ttv_v2",
    voice_description="The voice should be deep, authoritative, and resonant, with a calm yet commanding presence. It should have a distinct Indian accent with Gujarati-Hindi influence, and speak both Hindi and English with clear articulation and deliberate pacing. In English, the accent should reflect a formal Indian-English tone, marked by careful enunciation and strategic pauses. The delivery should feel inspiring, patriotic, and emotionally engaging, especially during public addresses. The voice must emphasize key phrases with conviction, often ending statements with powerful lines like “Jai Hind” or “Bharat Mata ki Jai.” The emotional range should include passionate, warm, and assertive modes depending on the context — such as national speeches, public outreach, or welfare campaigns.",
    text="Mitron, aaj ka Bharat naye sankalp ke saath aage badh raha hai. Hamara lakshya hai — ek aisa Bharat, jo viksit ho, swabhimani ho, aur sabke liye avsar se bhara ho. Digital India ho ya Swachh Bharat, yeh sirf yojanayen nahi hain, yeh ek rashtra ki pragati ki kahani hai. Main aap sabse nivedan karta hoon — is yatra mein apna yogdan dein. Bharat ko viksit rashtra banana hai. Saath milkar, hum is sapne ko sakar karenge. Jai Hind!",
)
for idx, preview in enumerate(voices.previews):
    # Convert base64 to audio buffer
    audio_buffer = base64.b64decode(preview.audio_base_64)

    # Save as MP3 file
    filename = f"voice_preview_{idx+1}.mp3"
    with open(filename, "wb") as f:
        f.write(audio_buffer)
    print(f"Saved preview: {preview.generated_voice_id} as {filename}")
