# models/media.py
# from datetime import datetime, timezone
# import uuid
# from bson import ObjectId
# from config import media_fs, media_collection
# import gridfs

# def save_media_to_gridfs(file_stream, filename: str, content_type: str) -> dict:
#     """
#     Save an incoming file into GridFS and record its metadata.
#     Returns the metadata document.
#     """
#     # store the file in GridFS => returns an ObjectId
#     file_id = media_fs.put(
#         file_stream,
#         filename=filename,
#         contentType=content_type
#     )

#     # create a metadata doc
#     media_id = str(uuid.uuid4())
#     doc = {
#         "media_id":    media_id,
#         "note_id": note_id,
#         "user_id": user_id,
#         "file_id":     file_id,             # reference to GridFS chunks
#         "filename":    filename,
#         "content_type": content_type,
#         "uploaded_at": datetime.now(timezone.utc)
#     }
#     media_collection.insert_one(doc)
#     return doc

# def get_media_metadata(media_id: str) -> dict | None:
#     """Lookup the metadata document by your UUID."""
#     return media_collection.find_one({"media_id": media_id})

# def get_media_file(file_id: ObjectId):
#     """Fetch the raw file from GridFS by its _id (ObjectId)."""
#     try:
#         return media_fs.get(file_id)      # returns a GridOut with .read(), .content_type, etc.
#     except gridfs.NoFile:
#         return None

# def delete_media(media_id: str) -> bool:
#     """
#     Remove both metadata and the file in GridFS.
#     Returns True if removed.
#     """
#     meta = get_media_metadata(media_id)
#     if not meta:
#         return False

#     # remove chunks + metadata in fs files/chunks
#     media_fs.delete(meta["file_id"])
#     # remove our metadata doc
#     result = media_collection.delete_one({"media_id": media_id})
#     return result.deleted_count == 1

# def list_recent_media(limit: int = 50) -> list[dict]:
#     """Return recent uploads (just metadata)."""
#     return list(media_collection
#                 .find()
#                 .sort("uploaded_at", -1)
#                 .limit(limit))


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