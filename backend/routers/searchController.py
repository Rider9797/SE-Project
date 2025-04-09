from flask import Blueprint, request, jsonify
from models.search import search_notes_by_title, log_search_query, get_recent_searches
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging

search_routes = Blueprint('search_routes', __name__)

@search_routes.route("/search", methods=['GET'])
@jwt_required()
def search():
    user_id = get_jwt_identity()
    query = request.args.get('q', '')
 
    if not query:
        return jsonify({'error': 'Missing search query'}), 400

    log_search_query(user_id, query)
    notes = search_notes_by_title(user_id, query)
    return jsonify({"notes":notes})

@search_routes.route('/search/recent', methods=['GET'])
def recent_searches(user):
    searches = get_recent_searches(user['user_id'])
    return jsonify({'recent': [s['query'] for s in searches]})
