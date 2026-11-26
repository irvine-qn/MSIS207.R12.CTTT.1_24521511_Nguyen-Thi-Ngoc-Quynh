# API CONTRACT – HW_2

Base URL: `http://localhost:<PORT>`

## GET /api/profiles

Response `200`

```json
[{ "_id": "string", "name": "string", "age": 0, "bio": "string", "imageUrl": "https://..." }]
```

Response `500` `{ "error": "string" }`

## POST /api/swipe

Request body

```json
{ "profileId": "string", "direction": "left | right | up" }
```

Response `201` ban ghi Swipe vua tao `{ _id, profileId, direction, createdAt, updatedAt }`

Response `400` `{ "error": "string" }` khi payload sai

Response `500` `{ "error": "string" }` khi loi server
