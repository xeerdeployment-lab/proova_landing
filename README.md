# axora

Premium marketing site for the arora community business platform.

```bash
npm install
npm run dev
```

The site introduces the brand, the opportunity, and the standards for participation. It does not publish products, compensation terms, or performance figures until those details are real and approved. Earnings are not guaranteed.

## Member dashboard (`/dashboard`)

| Build | `VITE_API_URL` | Data source |
| --- | --- | --- |
| any | set | Member API (session cookie auth) |
| `npm run dev` | not set | Local **development ledger** — generated demo data, clearly labelled, with scenario / +24h / reset controls in the sidebar |
| `npm run build` | not set | "Not connected" state. The development ledger is not bundled; no figures are shown |

**Plan rules** live in `src/data/planConfig.js`; **calculations** in `src/lib/plan.js` (integer cents, pure functions, no browser APIs — import them on the server so the backend and the UI previews share one implementation). Bases marked `confirmed: false` (withdrawal split, up/down pool division) need business sign-off.

### API contract

All money is integer cents. Mutating requests send an `Idempotency-Key` header; the server must return the original result for a repeated key and `409` for a key reused with a different body. Errors: `{ code, message }`.

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/me/account` | — | Full account snapshot (shape: `snapshot()` in `src/services/devLedger.js`), including `serverTime` |
| POST | `/me/stakes` | `{ amountCents }` | One active/pending stake per address |
| POST | `/me/restakes` | `{ amountCents }` | Only when capability is reached; `amountCents >= last stake` |
| POST | `/me/daily-income/claims` | — | Atomic; 24h interval by server time; clipped to remaining capability |
| POST | `/me/withdrawals` | `{ amountCents }` | Checks balance, pending withdrawals and capability; split via `withdrawalBreakdown` |
| PATCH | `/me/profile` | `{ displayName }` | |

Mutations respond `{ transactionId, status, amountCents, ..., account }`. `src/services/devLedger.js` is a working reference for the validation order and settlement behaviour.
