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
    }).sort("created_at", -1))  # Remove the duplicate function definition

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