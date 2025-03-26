from backend.config import notes_collection
from datetime import datetime, timezone
from bson.objectid import ObjectId

def create_note(user_id,title, content, ai_tag=None):
    note = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "ai_tag": ai_tag,
        "created_at": datetime.now(timezone.utc) ,
        "updated_at": datetime.now(timezone.utc) ,
        "deleted_at": None  # None until the note is deleted
    }
    result = notes_collection.insert_one(note)
    return str(result.inserted_id)


def get_notes_by_user(user_id):
    return list(notes_collection.find({"userId": user_id}, {"_id": 0}))

# Function to get a single note by ID
def get_note_by_id(note_id):
    return notes_collection.find_one({"_id": ObjectId(note_id)})

# Function to update a note
def update_note(note_id, data):
    return notes_collection.update_one({"_id": ObjectId(note_id)}, {"$set": data})

# Function to delete a note
def delete_note(note_id):
    return notes_collection.delete_one({"_id": ObjectId(note_id)})