# CASIOC

CASIOC is a calculator with a FastAPI backend and a browser-based frontend.

## Run locally

Install the frontend dependencies once from the repository root:

```bash
npm install
```

Start the backend in the first terminal:

```powershell
Set-Location backend
..\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

If the virtual environment is not activated, run
`..\venv\Scripts\python.exe -m uvicorn app.main:app --reload` instead.

Start the frontend in a second terminal from the repository root:

```powershell
npm run dev
```

Open <http://127.0.0.1:5173>. `npm start` also starts the frontend. The
frontend sends calculations to `http://127.0.0.1:8000` by default.

## API

- `GET /api/health` checks that the backend is running.
- `POST /api/calculate` accepts JSON such as `{"expression":"sqrt(81) + 2 ** 3"}`.
- `WS /ws` accepts `{"expression":"10 * 5"}` and sends calculation lifecycle
  events.

The REST and WebSocket endpoints use the same expression parser and support
arithmetic, parentheses, `sqrt`, `abs`, and `factorial`.

## Test the backend

From the repository root:

```powershell
Set-Location backend
..\venv\Scripts\python.exe -m pytest
```
