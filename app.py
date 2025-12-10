"""
FSRO - Financial System Risk Observatory
Main Application Entry Point
Reserve Bank of India
Powered by Spera Digital
"""

import uvicorn
import socket
import sys
from server import app

def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except socket.error:
            return True

def find_available_port(start_port: int = 8000, max_attempts: int = 10) -> int:
    """Find an available port starting from start_port"""
    for i in range(max_attempts):
        port = start_port + i
        if not is_port_in_use(port):
            return port
    return start_port

if __name__ == "__main__":
    default_port = 8000
    
    if is_port_in_use(default_port):
        print(f"⚠️  Port {default_port} is already in use!")
        available_port = find_available_port(default_port + 1)
        print(f"   Trying port {available_port} instead...")
        port = available_port
    else:
        port = default_port
    
    print()
    print("=" * 70)
    print("  FSRO - Financial System Risk Observatory")
    print("  Reserve Bank of India")
    print("  Powered by Spera Digital")
    print("=" * 70)
    print()
    print(f"  🌐 API Documentation: http://localhost:{port}/docs")
    print(f"  ❤️  Health Check: http://localhost:{port}/health")
    print(f"  🖥️  Frontend URL: http://localhost:3000")
    print()
    print("=" * 70)
    print()
    
    try:
        uvicorn.run(
            "server:app",
            host="127.0.0.1",
            port=port,
            reload=True,
            log_level="info"
        )
    except PermissionError:
        print("\n❌ Permission Error: Cannot bind to port.")
        print("   Try running as Administrator or use a different port.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)
