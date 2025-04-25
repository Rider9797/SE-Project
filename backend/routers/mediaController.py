from flask import Blueprint, request, jsonify, Response, url_for, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.media import save_media_to_gridfs, get_media_file, delete_media
from models.notes import get_note_by_id, update_note_content
from werkzeug.utils import secure_filename
from datetime import datetime
from bs4 import BeautifulSoup
import uuid, os

media_routes = Blueprint("media_routes", __name__)

ALLOWED_EXT = {"png","jpg","jpeg","gif","mp4","mp3","wav"}

def allowed_file(fn: str) -> bool:
    return "." in fn and fn.rsplit(".",1)[1].lower() in ALLOWED_EXT

@media_routes.route("/upload", methods=["POST"])
def upload_media_to_note():
    file = request.files.get("file")
    note_id = request.form.get("note_id")

    if not file or not note_id or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file or missing note_id"}), 400

    filename = secure_filename(file.filename)
    meta = save_media_to_gridfs(file.stream, filename, file.content_type, note_id)

    img_url = url_for("media_routes.serve_media", media_id=meta["media_id"], _external=True)
    img_tag = f'<img src="{img_url}" alt="{filename}" style="max-width: 300px; max-height: 300px; object-fit: contain; display: block; margin: 10px auto;"/>'

    note = get_note_by_id(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    updated_content = (note.get("content", "") or "") + "<br>" + img_tag
    update_note_content(note_id, updated_content)

    return jsonify({"message": "Media uploaded and added to note", "media_url": img_url}), 201

@media_routes.route("/<media_id>", methods=["GET"])
def serve_media(media_id):
    grid_out, meta = get_media_file(media_id)
    if not grid_out:
        return jsonify({"error": "Media not found"}), 404
    return Response(
        grid_out.read(),
        mimetype=meta["content_type"],
        headers={"Content-Disposition": f"inline; filename={meta['filename']}"}
    )

@media_routes.route("/delete/<media_id>", methods=["DELETE"])
@jwt_required()
def remove_media(media_id):
    # Delete media record and GridFS file
    meta = delete_media(media_id)
    if not meta:
        return jsonify({"error": "Media not found"}), 404

    # Also remove <img> tag from the associated note
    note = get_note_by_id(meta["note_id"])
    if note and note.get("content"):
        soup = BeautifulSoup(note["content"], "html.parser")
        for img in soup.find_all("img", src=lambda s: media_id in s):
            img.decompose()
        new_content = str(soup)
        update_note_content(meta["note_id"], new_content)

    return jsonify({"message": "Media deleted from GridFS and note content updated"}), 200