from flask import request


def get_pagination():
    """Return (limit, offset) from query params; caps limit at 100."""
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = int(request.args.get("offset", 0))
    return limit, offset
