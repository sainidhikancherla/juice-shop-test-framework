---
noteId: "537fa700e70a11f19b97e74098cd8721"
tags: []

---

# Juice Shop Test Automation Framework

An automated test framework for the OWASP Juice Shop web application, built with
Playwright and TypeScript. It tests the shop at three levels (UI, REST API and
database) and checks that all three agree with each other, including a full
checkout flow.

**26 automated tests, all passing** (10 smoke, 16 regression).

## What this project covers

| Area | What is tested |
|---|---|
| **UI** | Home page, login (valid and wrong password), data-driven product search (matching and no-match), basket add, remove and quantity change |
| **Checkout** | Full order with a new address, delivery option and card; empty address name is blocked; cannot continue without choosing a card |
| **API** | User registration, login, product lookup, basket add / view / remove, requests rejected without login |
| **Database** | SQL checks against the shop's SQLite database: user stored after registration, basket item stored and deleted, new user's basket is empty |

The tests link the layers together. A UI action is verified through the API, and
an API action is verified in the database.

## Tech stack

Playwright, TypeScript, Node.js, SQLite (read-only SQL checks), Git/GitHub

## Project structure

```
pages/        Page objects: HomePage, LoginPage, BasketPage, CheckoutPage
tests/api/    API tests
tests/ui/     UI and checkout tests
tests/db/     Database checks
test-data/    JSON inputs: search terms, product name, checkout address and card (all fake)
utils/        api.ts (API helpers), db.ts (read-only SQLite helper), testData.ts (JSON loader)
docs/images/  Screenshots used in this README
```

## Prerequisites

- Node.js with the built-in `node:sqlite` module (built and run with Node v26)
- Git
- OWASP Juice Shop running locally at http://localhost:3000

## How to run

1. Start Juice Shop (see https://github.com/juice-shop/juice-shop):
   ```
   git clone https://github.com/juice-shop/juice-shop.git --depth 1
   cd juice-shop
   npm install
   npm start
   ```
2. In this project:
   ```
   npm install
   npx playwright install chromium
   npm test
   npm run report
   ```

**Database checks:** the tests read the shop's SQLite file in read-only mode. By
default they expect the shop folder next to this project:
`..\juice-shop\data\juiceshop.sqlite`. If yours is elsewhere, set the path first:
```
$env:JUICE_DB_PATH = "C:\path\to\juice-shop\data\juiceshop.sqlite"
```

## Test scripts

| Command | What it runs |
|---|---|
| `npm test` | All 26 tests |
| `npm run test:smoke` | The 10 critical-path tests (`@smoke`) |
| `npm run test:regression` | The 16 remaining tests (`@regression`) |
| `npm run test:api` | API tests only (`tests/api`) |
| `npm run test:ui` | UI and checkout tests (`tests/ui`) |
| `npm run test:db` | Database checks only (`tests/db`) |
| `npm run report` | Opens the last HTML report |

Every test title ends with `@smoke` or `@regression`, so smoke plus regression
covers the whole suite.

## Debugging failures

When a test fails, Playwright keeps the evidence automatically:

- **Screenshot:** the page at the moment of failure
- **Trace:** a step-by-step recording of every action, network call and page state
- **HTML report:** everything above in one place

To investigate a failure:

1. Run `npm run report` to open the report.
2. Open the failed test and check the error message and the screenshot.
3. Open the trace to step through the test, and look at the network calls and the page at each step.



*A failed test opened in the Playwright trace viewer.*

**Retry policy:** no retries on a local machine, so a failing test is never
hidden. In CI, a failed test would get one retry to absorb rare environment
problems. A test that passes only on retry is treated as a bug to investigate,
not as a pass.

## Test overview

| ID | Layer | What it checks |
|---|---|---|
| API | API | Register, login, wrong password is rejected, `whoami`, product details, add to basket, item appears with the right quantity, remove item, basket empty after removal, new user starts with an empty basket, add without login is rejected |
| UI-01 | UI | Valid login succeeds |
| UI-01b | UI | Wrong password shows an error |
| UI-02 | UI | Search shows only matching products (data-driven from JSON) |
| UI-02b | UI | Search with no match shows the empty-state message |
| UI-04 | UI | Added product shows in the basket count and in the API basket |
| UI-05 | UI | Removed product disappears from the basket (UI and API agree) |
| UI-06 | UI | Increasing quantity updates the row, the API basket and the total |
| CHK-01 | Checkout | Complete an order with a new address and card; the confirmation page shows and the basket is emptied (checked through the API) |
| CHK-02 | Checkout | An address with an empty name cannot be submitted |
| CHK-03 | Checkout | Cannot proceed to review without choosing a card |
| DB-01 | Database | Registered user is stored in the Users table |
| DB-02 | Database | Item added through the API is stored in BasketItems |
| DB-03 | Database | Item removed through the API is deleted from BasketItems |
| DB-04 | Database | Login gives the user one empty basket |

## Design decisions

- **Independent tests.** Every test creates its own user through the API with a
  unique email, so tests do not depend on each other and can run in parallel.
- **API for setup, UI for the action.** Registration, login and adding the first
  basket item go through the API, which is faster and more stable than clicking
  through forms. The checkout tests start at the basket.
- **Verify from two sides.** UI results are confirmed through the API, and API
  results are confirmed in the database.
- **Page Object Model.** Locators and actions live in page objects. Test files
  only describe behaviour.
- **Data-driven tests.** Search terms, the product name and the checkout details
  live in JSON files. Product ids are looked up through the API instead of being
  hard-coded.
- **No fixed waits.** Tests rely on Playwright's auto-waiting, `expect` checks,
  `waitForResponse` for saves, and `expect.poll` for database reads.
- **Read-only database access.** The database helper opens the file read-only,
  waits briefly if the file is busy, and closes it after every query.
- **Local settings.** Two workers locally so the shop is not overloaded, and a
  10-second expect timeout because the shop is a local, single-process app.
- **Chromium only.** Cross-browser coverage is a possible extension.
- **Fake test data only.** Checkout uses a made-up address and a made-up card
  number. No real personal or payment data is used anywhere.

## Problems found and fixed

- **WebKit failed on Windows** while Chromium and Firefox passed, so the suite
  runs on Chromium only.
- **Duplicate emails in parallel runs.** A timestamp-based email collided when
  tests started in the same moment and registration returned 400. Fixed with
  `randomUUID()`.
- **Search is a substring match.** "apple juice" also returns "Pineapple Juice",
  so assertions use exact product names where uniqueness matters.
- **A broad locator matched the empty-state card.** `mat-card` also matched the
  "No results found" box, so product cards are now defined as cards that contain
  an Add to Basket button.
- **The basket button is named "Show the shopping cart",** not "basket". The
  locator was corrected using the real name from Playwright's code generator.
- **The remove button is an icon with no text,** so it is found through its
  table column inside the product's row, not by position.
- **Tests read the page before the shop had saved.** Add, remove and quantity
  actions now wait for the matching network request before the next step.
- **The database file was not where the search first pointed.** The SQLite files
  inside `node_modules` are the driver, not the data. The real file is in the
  shop's `data` folder, and it was confirmed to be live by registering a user and
  finding the row.
- **`database is locked` in parallel runs.** The shop writes to its SQLite file
  while tests read it. Read queries now set a busy timeout, so they wait for the
  write instead of failing.
- **Intermittent "no product cards" failures under parallel load.** The tests
  passed alone but failed in full runs because the local shop was slow with four
  workers. The suite now uses two workers, waits for the product-list request in
  `HomePage.open()`, and uses a longer expect timeout.
- **Hard-coded product id.** The tests assumed one product had a fixed id. The
  id is now looked up by product name, so the tests do not depend on how the shop
  seeds its data.
- **Checkout stayed disabled when the item was added through the API.** The test
  clicked the basket before the post-login redirect finished, so the page was
  still on the product list. Tests now wait for the redirect and for the basket
  row before continuing.
- **Checkout empties the basket, it does not delete it.** After an order the
  basket API still returns 200 with no products, so the test asserts an empty
  basket instead of expecting a 404.
- **Orders are not in the SQLite file.** The database has no orders table, so the
  order is verified through the confirmation page and the basket API.

## Limitations and possible extensions

- Runs on Chromium only (Firefox and WebKit not covered)
- Database checks need the shop and this project on the same machine
- Delivery speed and price totals are not asserted in checkout
- A GitHub Actions pipeline is planned

## Notes

The application under test is an intentionally insecure demo shop that runs
locally and is used for practice. All test data is generated, and no real
personal data is used. Juice Shop is an OWASP project (MIT licence).