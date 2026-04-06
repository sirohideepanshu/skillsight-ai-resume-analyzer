"""
Legacy module kept only to avoid import confusion.

Use `api_server:app` as the single FastAPI entrypoint for local runs and Render.
"""


def get_api_entrypoint() -> str:
    return "api_server:app"
