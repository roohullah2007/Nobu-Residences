# Condos.ca Developers API — Documentation

## Authentication

Every request requires an `X-API-Key` header.

```
X-API-Key: YOUR_API_KEY_HERE
```

No key = 401 error. Wrong key = 403 error. Rate limit = 200 requests/minute.

---

## Base URL

```
https://developers-api.royal-scene-c64e.workers.dev
```

---

## Endpoints

### 1. Get Stats

```
GET /api/stats
```

**Response:**
```json
{
  "total_developers": 1965,
  "total_buildings": 5459,
  "developers_with_website": 583,
  "developers_with_logo": 264,
  "top_developers": [
    { "name": "Bosa Development", "building_count": 78 },
    { "name": "Onni Group", "building_count": 68 }
  ]
}
```

---

### 2. List All Developers

```
GET /api/developers?page=1&limit=50&sort=building_count&order=desc
```

**Parameters:**
| Param | Default | Options |
|-------|---------|---------|
| page | 1 | any number |
| limit | 50 | 1-200 |
| sort | building_count | name, building_count, slug |
| order | desc | asc, desc |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "bosa-development",
      "name": "Bosa Development",
      "building_count": 78,
      "website": "https://thinkbosa.com",
      "logo_url": "https://batuserin.com/developerlogos/bosa-development.jpg",
      "profile_url": "https://condos.ca/developers/bosa-development"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1965,
    "total_pages": 40
  }
}
```

---

### 3. Get Single Developer (with all buildings)

```
GET /api/developers/bosa-development
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "slug": "bosa-development",
    "name": "Bosa Development",
    "building_count": 78,
    "website": "https://thinkbosa.com",
    "logo_url": "https://batuserin.com/developerlogos/bosa-development.jpg",
    "profile_url": "https://condos.ca/developers/bosa-development",
    "buildings": [
      {
        "id": 1,
        "building_name": "The Brighton",
        "building_address": "1030 Quebec St, Vancouver",
        "building_url": "https://condos.ca/vancouver/the-brighton-120-milross-ave-1030-1060-quebec-st"
      },
      {
        "id": 2,
        "building_name": "City Gate I & II",
        "building_address": "1159 Main St, Vancouver",
        "building_url": "https://condos.ca/vancouver/city-gate-i-ii-1182-1188-quebec-st-1159-main-st"
      }
    ]
  }
}
```

---

### 4. List/Filter Buildings

```
GET /api/buildings?page=1&limit=50
GET /api/buildings?developer=tridel
GET /api/buildings?city=Toronto
GET /api/buildings?developer=bosa-development&city=Vancouver
```

**Parameters:**
| Param | Description |
|-------|-------------|
| page | Page number (default: 1) |
| limit | Results per page (default: 50, max: 200) |
| developer | Filter by developer slug |
| city | Filter by city name (partial match) |

**Response:**
```json
{
  "data": [
    {
      "id": 100,
      "developer_slug": "tridel",
      "building_name": "101 Erskine",
      "building_address": "101 Erskine Ave, Toronto",
      "building_url": "https://condos.ca/toronto/101-erskine-101-erskine-ave",
      "developer_name": "Tridel",
      "developer_website": "https://www.tridel.com",
      "developer_logo": "https://batuserin.com/developerlogos/tridel.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 35,
    "total_pages": 1
  }
}
```

---

### 5. Search Developers & Buildings

```
GET /api/search?q=menkes
```

**Parameters:**
| Param | Description |
|-------|-------------|
| q | Search term (min 2 characters, searches names and addresses) |

**Response:**
```json
{
  "developers": [
    {
      "slug": "menkes-developments",
      "name": "Menkes Developments",
      "building_count": 31,
      "website": "https://www.menkes.com",
      "logo_url": "https://batuserin.com/developerlogos/menkes-developments.jpg"
    }
  ],
  "buildings": [
    {
      "building_name": "4800 Yonge by Menkes",
      "building_address": "4800 Yonge St, Toronto",
      "developer_name": "Menkes Developments"
    }
  ]
}
```

---

## Code Examples

### JavaScript (fetch)
```javascript
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://developers-api.royal-scene-c64e.workers.dev';

// Get all developers
const response = await fetch(`${BASE_URL}/api/developers?limit=100`, {
  headers: { 'X-API-Key': API_KEY }
});
const data = await response.json();
console.log(data);
```

### React / Next.js
```javascript
async function getDeveloper(slug) {
  const res = await fetch(
    `https://developers-api.royal-scene-c64e.workers.dev/api/developers/${slug}`,
    { headers: { 'X-API-Key': process.env.DEVELOPERS_API_KEY } }
  );
  if (!res.ok) throw new Error('API error');
  return res.json();
}
```

### PHP (WordPress)
```php
function get_developer($slug) {
  $response = wp_remote_get(
    "https://developers-api.royal-scene-c64e.workers.dev/api/developers/{$slug}",
    array('headers' => array('X-API-Key' => 'YOUR_API_KEY'))
  );
  return json_decode(wp_remote_retrieve_body($response), true);
}
```

### Python
```python
import requests

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://developers-api.royal-scene-c64e.workers.dev'

response = requests.get(
    f'{BASE_URL}/api/developers/tridel',
    headers={'X-API-Key': API_KEY}
)
data = response.json()
print(data)
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Missing API key |
| 403 | Invalid API key or blocked |
| 404 | Developer/endpoint not found |
| 429 | Rate limit exceeded (200 req/min) |
| 500 | Server error |

---

## Logo Images

Developer logos are hosted at:
```
https://batuserin.com/developerlogos/{slug}.jpg
```

264 out of 1965 developers have logos. Use the `logo_url` field from the API — it will be empty string if no logo is available.

---

## Data Coverage

- **1,965 developers** from condos.ca
- **5,459 buildings** with names, addresses, and URLs
- **583 developer websites** verified via Google
- **264 developer logos** self-hosted
- Data source: condos.ca (scraped July 2026)
