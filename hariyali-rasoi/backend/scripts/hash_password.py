"""Generate bcrypt hash for admin password. Usage: python scripts/hash_password.py yourpassword"""
import sys

import bcrypt

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/hash_password.py <password>")
        sys.exit(1)
    hashed = bcrypt.hashpw(sys.argv[1].encode("utf-8"), bcrypt.gensalt())
    print(hashed.decode("utf-8"))
