import http.server
import socketserver
import os
import socket

PORT = 8085
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app/build/outputs/apk/debug")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    ip = get_ip()
    url = f"http://{ip}:{PORT}/app-debug.apk"
    print("=" * 60)
    print(f"📱 APK Download URL for Phone: {url}")
    print("=" * 60)
    print(f"Serving files from: {DIRECTORY}")
    print(f"Listening on http://0.0.0.0:{PORT}...")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
