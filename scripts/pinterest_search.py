import urllib.request
import urllib.parse
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def search_pinterest(query):
    encoded = urllib.parse.quote(query)
    url = f'https://www.pinterest.com/search/pins/?q={encoded}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            # Look for 474x or 736x or originals pinimg images
            matches = re.findall(r'https://i\.pinimg\.com/(?:originals|736x|474x)/[a-zA-Z0-9/_.-]+\.jpg', html)
            # Upgrade 474x to 736x
            upgraded = [m.replace('/474x/', '/736x/') for m in matches]
            unique = list(dict.fromkeys(upgraded))
            return unique
    except Exception as e:
        print(f"Error searching for '{query}':", e)
        return []

if __name__ == '__main__':
    queries = [
        'honey with pistachios jar',
        'extra virgin olive oil bottle aesthetic',
        'raw honey with honeycomb jar'
    ]
    for q in queries:
        imgs = search_pinterest(q)
        print(f"Query '{q}': found {len(imgs)} images")
        for img in imgs[:3]:
            print("  ", img)
