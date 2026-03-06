from flask import request


def get_pagination():
    """Return (limit, offset) from query params; caps limit at 100."""
    try:
        limit = min(int(request.args.get("limit", 20)), 100)
        offset = max(int(request.args.get("offset", 0)), 0)
    except (ValueError, TypeError):
        limit, offset = 20, 0
    return limit, offset
