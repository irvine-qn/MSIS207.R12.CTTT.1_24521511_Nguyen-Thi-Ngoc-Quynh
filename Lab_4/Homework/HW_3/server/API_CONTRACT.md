# API Contract – HW_3 Appeal Tribunal

Base URL: `http://localhost:<PORT>`

## Dossier

```json
{
  "playerID": "himass",
  "name": "Himass",
  "team": "string",
  "violations": [
    {
      "code": "string",
      "description": "string",
      "matchDate": "ISO date string",
      "severity": 1,
      "penaltyMatches": 0
    }
  ],
  "appealDeadline": 1767225600000
}
```

- `severity`: số nguyên 1 đến 5.
- `penaltyMatches`: số trận bị cấm thi đấu, số nguyên không âm.
- `appealDeadline`: timestamp tuyệt đối (ms, epoch UTC).

## GET /api/dossiers/:playerID

| Status | Body |
| --- | --- |
| 200 | Dossier |
| 404 | `{ "error": "Dossier not found" }` |

## POST /api/appeals

Body:

```json
{
  "playerID": "himass",
  "reason": "string, 30 đến 1000 ký tự",
  "evidenceUrl": "https://...",
  "contactEmail": "name@example.com"
}
```

| Status | Body |
| --- | --- |
| 201 | `{ "id": "string", "playerID": "string", "createdAt": "ISO date string" }` |
| 400 | `{ "error": "string", "errors": { "<field>": "message" } }` |

Trả 400 khi payload sai rule, `playerID` không tồn tại, hoặc đã quá `appealDeadline`.

## Validation rule dùng chung

`shared/appealRules.js` export `validateAppeal(values)`, được import ở cả client và server.

- `playerID`: chuỗi không rỗng.
- `reason`: chuỗi, sau khi trim dài từ 30 đến 1000 ký tự.
- `evidenceUrl`: URL hợp lệ với giao thức `https:`.
- `contactEmail`: email đúng định dạng.
