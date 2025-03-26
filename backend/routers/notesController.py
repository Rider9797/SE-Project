from flask import Blueprint, request, jsonify
from models.notes import create_note, get_notes_by_user, get_note_by_id, update_note, delete_note
