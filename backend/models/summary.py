from datetime import datetime, timezone
from config import summary_collection  # Assuming you correctly imported the MongoDB collection

# Create a new summary
def create_summary(note_id, content):
    new_summary = {
        "note_id": note_id,
        "content": content,
        "generated_at": datetime.now(timezone.utc)
    }
    result = summary_collection.insert_one(new_summary)
    return str(result.inserted_id)

# Retrieve a summary by note_id
def retrieve_summary(note_id):
    summary = summary_collection.find_one({"note_id": note_id})
    if summary:
        summary["_id"] = str(summary["_id"])  # Make ObjectId JSON-serializable
        return summary
    else:
        return None

# Replace existing summary (delete if exists, then insert)
def replace_summary(note_id, content):
    # Delete all existing summaries for this note_id
    summary_collection.delete_many({"note_id": note_id})
    
    # Insert new summary
    new_summary = {
        "note_id": note_id,
        "content": content,
        "generated_at": datetime.now(timezone.utc)
    }
    result = summary_collection.insert_one(new_summary)
    return str(result.inserted_id)

# Update existing summary or create if it doesn't exist
def update_summary(note_id, content):
    existing_summary = summary_collection.find_one({"note_id": note_id})
    
    if existing_summary:
        # Update the existing summary
        summary_collection.update_one(
            {"_id": existing_summary["_id"]},
            {
                "$set": {
                    "content": content,
                    "generated_at": datetime.now(timezone.utc)
                }
            }
        )
        return str(existing_summary["_id"])
    else:
        # Insert a new summary
        new_summary = {
            "note_id": note_id,
            "content": content,
            "generated_at": datetime.now(timezone.utc)
        }
        result = summary_collection.insert_one(new_summary)
        return str(result.inserted_id)


def retrieve_summary(note_id):
    summary = summary_collection.find_one({"note_id": note_id})
    if summary:
        summary["_id"] = str(summary["_id"])
        return summary
    return None
