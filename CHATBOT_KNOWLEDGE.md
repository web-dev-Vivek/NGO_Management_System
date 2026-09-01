# Chatbot Knowledge Base

The chatbot should answer questions using the organization's supplied data files.

## Intended Questions
- Campaign information
- Volunteer participation
- Task assignments
- Logged/verified hours
- Certificates
- Organization statistics
- Policies contained in uploaded data

## Behavior
1. Answer only from available organization data.
2. If data is missing, say that the supplied data does not contain the answer.
3. Do not invent NGO statistics or policies.
4. Distinguish between verified facts and unavailable information.
5. Respect user permissions when exposing internal data.

## Suggested Architecture
Frontend Chat UI → Backend Chat API → Data retrieval layer → LLM → Permission filter → Response.
