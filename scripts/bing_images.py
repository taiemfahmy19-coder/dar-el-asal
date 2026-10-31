import urllib.request
import urllib.parse
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def search_bing_images(query, count=5):
    encoded = urllib.parse.quote(query)
    url = f'https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode('utf-8', errors='ignore')
            # Extract murl
            murls = re.findall(r'murl&quot;:&quot;(https?://[^&quot;]+\.(?:jpg|jpeg|png))', html)
            # Filter valid
            valid = [u for u in murls if not any(x in u.lower() for x in ['logo', 'icon', 'advert'])]
            return valid[:count]
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

if __name__ == '__main__':
    test_queries = [
        'honey jar with pistachios product photography',
        'raw honeycomb in honey jar photography',
        'extra virgin olive oil bottle aesthetic photography'
    ]
    for tq in test_queries:
        urls = search_bing_images(tq)
        print(f"Query '{tq}': found {len(urls)} images")
        for u in urls[:2]:
            print("  ->", u)
