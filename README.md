# Tourify

Tourify is a frontend-only college Web Technology travel project. It provides a Client travel site and a separate Admin portal for managing shared tour data.

## Technologies

- HTML5 and CSS3
- Bootstrap 5 and Bootstrap Icons
- Vanilla JavaScript
- Browser `localStorage`

## Structure

- `CLIENT SIDE/` — Home, destinations, tours, details, authentication, account, booking, payment simulation and contact pages.
- `ADMIN SIDE/` — Separate Admin login, dashboard and consolidated Handling page.

## Run locally

Open `CLIENT SIDE/index.html` in a browser. For more reliable relative-asset behavior, serve the project folder with any static file server and open the Client page. The Admin portal is at `ADMIN SIDE/login.html`.

## Main features

Client pages read tours and destinations from shared records, support search and filters, authenticate registered users, protect My Account, validate bookings and save simulated confirmations. Contact and newsletter submissions are stored for Admin review. Admin Handling manages tours, destinations, bookings, users and messages without displaying passwords.

## Storage and limitations

Client and Admin use compatible `tourify_` localStorage keys in the same browser profile. Data is local to that browser and can be lost if browser storage is cleared; there is no backend synchronization or server-side validation. Authentication is suitable only for this frontend demonstration and is not production-secure. Payments are simulated only; no money is charged and complete card details are not stored.

## Testing status

All project JavaScript files passed `node --check`, and targeted static path, storage-key, form-action, INR and navigation checks were performed during final audit. Browser interaction testing was not completed because the available browser blocked local-file URLs and no Python/Node static server runtime was available in the environment. Manual testing of Client and Admin flows remains recommended before submission.
