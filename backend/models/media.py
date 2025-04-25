from config import media_fs, media_collection
from datetime import datetime, timezone
import uuid
from bson import ObjectId


def save_media_to_gridfs(file_stream, filename: str, content_type: str, note_id: str) -> dict:
    """
    Save an incoming file into GridFS, record its metadata (including note_id), and return the metadata document.
    """
    file_id = media_fs.put(
        file_stream,
        filename=filename,
        contentType=content_type
    )

    media_id = str(uuid.uuid4())
    doc = {
        "media_id":     media_id,
        "note_id":      note_id,
        "file_id":      file_id,
        "filename":     filename,
        "content_type": content_type,
        "uploaded_at":  datetime.now(timezone.utc)
    }
    media_collection.insert_one(doc)
    return doc


def get_media_file(media_id: str):
    """
    Fetch the raw file stream and metadata for a given media_id.
    """
    meta = media_collection.find_one({"media_id": media_id})
    if not meta:
        return None, None
    try:
        grid_out = media_fs.get(meta["file_id"])
    except Exception:
        return None, meta
    return grid_out, meta


def delete_media(media_id: str) -> dict | None:
    """
    Delete a file from GridFS and its metadata. Return metadata if found and deleted.
    """
    meta = media_collection.find_one({"media_id": media_id})
    if not meta:
        return None

    # Remove file chunks in GridFS
    media_fs.delete(meta["file_id"])
    # Remove metadata document
    media_collection.delete_one({"media_id": media_id})
    return meta