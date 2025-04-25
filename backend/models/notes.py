from config import notes_collection, summary_collection
from models.summary import update_summary
from models.summary import retrieve_summary  # Make sure this is the correct path

from datetime import datetime, timezone
from bson.objectid import ObjectId
import google.generativeai as genai
from bs4 import BeautifulSoup

# Initialize Gemini API
genai.configure(api_key="AIzaSyBmD2nB6uSYDBFo7kzmMTz5h31KZX3gmjk")  

model = genai.GenerativeModel("models/gemini-1.5-flash")

def extract_clean_text(html_content: str) -> str:
    """
    Takes raw HTML content as input and returns cleaned plain text.
    """
    soup = BeautifulSoup(html_content, "html.parser")

    # Remove script and style elements
    for script_or_style in soup(["script", "style"]):
        script_or_style.extract()

    # Get text and clean up whitespace
    text = soup.get_text(separator=' ')
    clean_text = ' '.join(text.split())

    return clean_text

def create_note(user_id, title, content, ai_tag=None):
    note = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "ai_tag": ai_tag,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "deleted_at": None
    }
    result = notes_collection.insert_one(note)
    return str(result.inserted_id)

def get_notes_by_user(user_id):
    return list(notes_collection.find({
        "user_id": user_id,
        "deleted_at": None
    }).sort("created_at", -1).limit(4))  # Remove the duplicate function definition

def get_note_by_id(note_id):
    return notes_collection.find_one({"_id": ObjectId(note_id)})

def update_note_content(note_id, content):  # Add this new function
    return notes_collection.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": {
            "content": content,
            "updated_at": datetime.now(timezone.utc)
        }}
    )

def delete_note(note_id):
    return notes_collection.update_one(  # Soft delete instead of actual deletion
        {"_id": ObjectId(note_id)},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )


from io import BytesIO
import xhtml2pdf
from flask import send_file, jsonify
from flask import make_response

from xhtml2pdf import pisa

from xhtml2pdf import pisa
from io import BytesIO

def get_pdf_note(note_id):
    print(f"Fetching note with ID: {note_id}")
    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found!")
        return jsonify({"msg": "Note not found or deleted"}), 404

    html = f"""
    <html>
      <body>
        <h1 style="text-align: center; font-size: 18pt; font-family: Arial, sans-serif;">
            {note['title']}
        </h1>
        <div style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5;">
            {note['content']}
        </div>
      </body>
    </html>
    """

    pdf_output = BytesIO()
    try:
        pisa_status = pisa.CreatePDF(html, dest=pdf_output)
        if pisa_status.err:
            print(f"Error generating PDF: {pisa_status.err}")
            return jsonify({"msg": "Error generating PDF"}), 500
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return jsonify({"msg": "Error generating PDF"}), 500

    pdf_output.seek(0)

    response = make_response(pdf_output.read())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f"attachment; filename={note['title']}.pdf"
    return response


import html2text
from flask import Response

def get_markdown_note(note_id):
    print(f"Fetching note with ID: {note_id}")
    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found!")
        return jsonify({"msg": "Note not found or deleted"}), 404

    # Build HTML just like you did for PDF
    html = f"""
    <html>
      <body>
        <h1>{note['title']}</h1>
        <div>
            {note['content']}
        </div>
      </body>
    </html>
    """

    try:
        markdown = html2text.html2text(html)
        print("Generated Markdown:", markdown)
    except Exception as e:
        print(f"Error converting to Markdown: {e}")
        return jsonify({"msg": "Error generating Markdown"}), 500

    # Return as downloadable .md file
    response = Response(markdown)
    response.headers['Content-Type'] = 'text/markdown'
    response.headers['Content-Disposition'] = f"attachment; filename={note['title']}.md"
    return response




def get_pdf_summary(note_id):
    print(f"Fetching note for summary: {note_id}")

    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found for summary")
        return jsonify({"msg": "Note not found or deleted"}), 404

    try:
        print("Note content:", note.get('content', 'No content available'))

        prompt = f"Summarize this note in a fun way yipeeee:\n\n{note['content']}"
        response = model.generate_content(prompt)
        summary = response.text
        print("Generated summary:", summary)

        # ✅ Call fixed update_summary
        update_summary(str(note["_id"]), summary)

    except Exception as e:
        print(f"Gemini summary error: {e}")
        return jsonify({"msg": f"Error generating summary: {str(e)}"}), 500

    return jsonify({"summary": summary}), 200

def get_saved_summary(note_id):
    print(f"Fetching saved summary for note_id: {note_id}")
    
    try:
        summary = retrieve_summary(note_id)
        
        if not summary:
            print("No summary found.")
            return jsonify({"msg": "Summary not found for this note"}), 404
        
        return jsonify({"summary": summary["content"]}), 200

    except Exception as e:
        print(f"Error retrieving summary: {e}")
        return jsonify({"msg": f"Error retrieving summary: {str(e)}"}), 500

def get_quiz(note_id):
    print(f"Fetching note for summary: {note_id}")

    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found for summary")
        return jsonify({"msg": "Note not found or deleted"}), 404

    try:
        print("Note content:", note.get('content', 'No content available'))
        prompt = f"make  quiz  out of this, have questions first and all the answers after :\n\n{note['content']}"
        response = model.generate_content(prompt)
        quiz = response.text
        print("Generated quiz", quiz)
    except Exception as e:
        print(f"Gemini quiz error: {e}")
        return jsonify({"msg": f"Error generating quiz: {str(e)}"}), 500

    return jsonify({"quiz": quiz}), 200



from gtts import gTTS
from io import BytesIO
from flask import Flask, request, send_file, jsonify
from bson.objectid import ObjectId

from config import notes_collection  # Assuming you have this set up

    
import asyncio
from io import BytesIO
from bson import ObjectId
from flask import send_file, jsonify
import edge_tts
from config import notes_collection

async def _generate_tts(text: str) -> BytesIO:
    mp3_buffer = BytesIO()
    communicate = edge_tts.Communicate(text, voice="ur-PK-AsadNeural")

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            mp3_buffer.write(chunk["data"])

    mp3_buffer.seek(0)
    return mp3_buffer
def text_to_speech(note_id):
    try:
        # Fetch the note
        note = notes_collection.find_one({
            "_id": ObjectId(note_id),
            "deleted_at": None
        })

        if not note:
            return jsonify({"msg": "Note not found or deleted"}), 404

        note_content_html = note.get("content", "No content available")

        # Convert HTML to clean plain text
        clean_text = extract_clean_text(note_content_html)

        # Generate MP3 from clean text
        mp3_output = asyncio.run(_generate_tts(clean_text))

        return send_file(
            mp3_output,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name=f"note_{note_id}.mp3"
        )

    except Exception as e:
        print(f"Edge TTS error: {e}")
        return jsonify({"msg": f"Error generating speech: {str(e)}"}), 500


from flask import jsonify
from bson import ObjectId

def SelectAndEnhance(note_id, user_prompt):
    print(f"Enhancing note {note_id} with prompt: {user_prompt}")

    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found")
        return jsonify({"msg": "Note not found or deleted"}), 404

    note_content = note.get('content', 'No content available')
    prompt = f"{user_prompt}\n\n{note_content}"

    try:
        response = model.generate_content(prompt)
        result_text = response.text
        print("Enhanced result:", result_text)

    except Exception as e:
        print(f"Prompt enhancement error: {e}")
        return jsonify({"msg": f"Error enhancing note: {str(e)}"}), 500

    return jsonify({"result": result_text}), 200




import json
import re
from bson import ObjectId
from flask import jsonify
from config import notes_collection
from bs4 import BeautifulSoup

# Reuse your existing Gemini model and clean text function
# from your setup:
# - `model = genai.GenerativeModel(...)`
# - `extract_clean_text(...)`

def autotag_note(note_id):
    print(f"Auto-tagging note: {note_id}")

    # Fetch note
    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        return jsonify({"msg": "Note not found or deleted"}), 404

    raw_html = note.get("content", "")
    plain_text = extract_clean_text(raw_html)

    prompt = (
        "Given this note content, return a JSON object with the following keys:\n"
        "keep the keys short, max 3 words, no more than that important:\n"
        "- main_subject (string)\n"
        "- overarching_scheme (string)\n"
        "- sub_topic (string)\n\n"
        "Only return a valid JSON object. Here's the note:\n\n"
        f"{plain_text}"
    )

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        print("Gemini response:", raw_text)

        # Clean up markdown-style formatting
        cleaned = re.sub(r"^```json|```$", "", raw_text, flags=re.MULTILINE).strip()

        # Parse to dict
        tag_data = json.loads(cleaned)

        # Validate keys exist
        required_keys = {"main_subject", "overarching_scheme", "sub_topic"}
        if not required_keys.issubset(tag_data.keys()):
            return jsonify({"msg": "Incomplete tag structure"}), 400

        # Save to DB
        notes_collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": {
                "ai_tag": tag_data
            }}
        )

        return jsonify({"msg": "Auto-tagging complete", "tags": tag_data}), 200

    except Exception as e:
        print("Auto-tagging error:", e)
        return jsonify({"msg": f"Error during auto-tagging: {str(e)}"}), 500


from bson import ObjectId
from flask import jsonify
from config import notes_collection

def retrieve_tags(note_id):
    """
    Retrieves and returns the ai_tag JSON object from a note,
    converting all values to strings.
    """
    try:
        note = notes_collection.find_one({
            "_id": ObjectId(note_id),
            "deleted_at": None
        })

        if not note:
            return jsonify({"msg": "Note not found"}), 404

        ai_tag = note.get("ai_tag", {})
        if not isinstance(ai_tag, dict):
            return jsonify({"msg": "No AI tags found"}), 404

        # Convert all values to strings
        converted = {k: str(v) for k, v in ai_tag.items()}

        return jsonify({"tags": converted}), 200

    except Exception as e:
        print(f"Error retrieving tags: {e}")
        return jsonify({"msg": f"Error retrieving tags: {str(e)}"}), 500
