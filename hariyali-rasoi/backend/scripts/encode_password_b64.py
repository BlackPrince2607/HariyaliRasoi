"""Encode bcrypt hash as base64 for Railway (avoids `$` interpolation issues).

Usage:
  python scripts/hash_password.py mypassword
  python scripts/encode_password_b64.py '$2b$12$...paste-hash-here...'
"""
import base64
import sys

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/encode_password_b64.py <bcrypt-hash>")
        sys.exit(1)
    hashed = sys.argv[1]
    print(base64.b64encode(hashed.encode("utf-8")).decode("utf-8"))
