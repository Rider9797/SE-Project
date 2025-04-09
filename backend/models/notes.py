from config import notes_collection
from datetime import datetime, timezone
from bson.objectid import ObjectId




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
    print(f"Fetching note with ID: {note_id}")  # Debug print statement
    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "deleted_at": None
    })

    if not note:
        print("Note not found!")  # Debug statement
        return jsonify({"msg": "Note not found or deleted"}), 404  # Return a 404 response if not found

    # Just raw text: title + content, no HTML
    raw_text = f"{note['title']}\n\n{note['content']}"

    # Wrap the raw text in a <pre> tag to preserve spacing
    html = f"<pre>{raw_text}</pre>"

    # Convert HTML to PDF using xhtml2pdf
    pdf_output = BytesIO()
    try:
        pisa_status = pisa.CreatePDF(html, dest=pdf_output)
        if pisa_status.err:
            print(f"Error generating PDF: {pisa_status.err}")  # Print error if PDF generation fails
            return jsonify({"msg": "Error generating PDF"}), 500  # Return a 500 response if PDF generation fails
    except Exception as e:
        print(f"Error generating PDF: {e}")  # Print the exception if something goes wrong
        return jsonify({"msg": "Error generating PDF"}), 500

    # Get the generated PDF data
    pdf_output.seek(0)  # Move the pointer to the beginning of the BytesIO buffer

    response = make_response(pdf_output.read())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f"attachment; filename={note['title']}.pdf"
    return response
