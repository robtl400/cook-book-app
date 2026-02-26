from flask import Blueprint, jsonify
from flask_login import login_required, current_user

from app import db
from models.comment import Comment

comment_bp = Blueprint("comments", __name__, url_prefix="/api/comments")


@comment_bp.delete("/<int:comment_id>")
@login_required
def delete_comment(comment_id):
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify({"error": "Comment not found", "message": "Failed"}), 404

    # Allow deletion by comment author or post owner
    if comment.user_id != current_user.id and comment.post.user_id != current_user.id:
        return jsonify({"error": "Forbidden", "message": "Failed"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"data": None, "message": "Comment deleted"}), 200
