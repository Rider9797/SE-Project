from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notes import create_note, get_notes_by_user, get_note_by_id, update_note_content, delete_note
from bson.objectid import ObjectId
from datetime import datetime

notes_routes = Blueprint("notes_routes", __name__)

@notes_routes.route("/notes", methods=["GET"])
@jwt_required()
def get_user_notes():  # Renamed from get_notes to avoid conflict
    user_id = get_jwt_identity()
    notes = get_notes_by_user(user_id)
    processed_notes = []
    for note in notes:
        note['_id'] = str(note['_id'])
        note['created_at'] = note['created_at'].isoformat()
        processed_notes.append(note)
    return jsonify(processed_notes), 200

@notes_routes.route("/notes/<note_id>", methods=["GET"])
@jwt_required()
def get_single_note(note_id):  # New endpoint to get single note
    user_id = get_jwt_identity()
    note = get_note_by_id(note_id)
    if note and note['user_id'] == user_id:
        note['_id'] = str(note['_id'])
        note['created_at'] = note['created_at'].isoformat()
        return jsonify(note), 200
    return jsonify({"msg": "Note not found"}), 404

@notes_routes.route("/notes", methods=["POST"])
@jwt_required()
def create_note_route():
    data = request.json
    user_id = get_jwt_identity()
    note_id = create_note(
        user_id=user_id,
        title=data['title'],
        content=data.get('content', '')  # Fixed syntax: data.get() not data.get[]
    )
    response = jsonify({"note_id": str(note_id)}), 201
    # response.headers.add('Access-Control-Allow-Credentials', 'true')
    # response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    return response

@notes_routes.route("/notes/<note_id>", methods=["PUT"])
@jwt_required()
def update_note_route(note_id):  # Renamed to avoid conflict
    data = request.json
    user_id = get_jwt_identity()
    
    # Verify note belongs to user
    note = get_note_by_id(note_id)
    if not note or note['user_id'] != user_id:
        return jsonify({"msg": "Note not found"}), 404
    
    update_note_content(note_id, data['content'])
    return jsonify({"msg": "Note updated"}), 200

@notes_routes.route("/notes/<note_id>", methods=["DELETE"])
@jwt_required()
def delete_note_route(note_id):
    user_id = get_jwt_identity()
    
    # Verify note belongs to user
    note = get_note_by_id(note_id)
    if not note or note['user_id'] != user_id:
        return jsonify({"msg": "Note not found"}), 404
    
    delete_note(note_id)
    return jsonify({"msg": "Note deleted"}), 200