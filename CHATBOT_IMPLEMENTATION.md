# Chatbot Implementation

## Frontend
Create a reusable Chatbot component with:
- Message history
- User/assistant message styles
- Loading state
- Error state
- Input box
- Send button

## Backend
Suggested endpoint:
`POST /api/chat`

Request:
```json
{
  "message": "How many verified volunteer hours were logged?"
}
```

Response:
```json
{
  "answer": "...",
  "sources": []
}
```

## Data Grounding
For structured MongoDB data, retrieve authorized records first and pass only relevant context to the model.

For uploaded documents, use a retrieval pipeline:
Document → chunking → embeddings/index → retrieval → context → model response.

## Security
- Authenticate requests.
- Apply RBAC before retrieval.
- Never expose private records to unauthorized users.
- Validate input size.
- Rate-limit the endpoint.
