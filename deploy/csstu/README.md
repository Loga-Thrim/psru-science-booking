# Booking page on csstu.psru.ac.th

A copy of the booking site served from the university's student server, for
campus networks where the university firewall blocks the droplet's
`*.sslip.io` address. `csstu.psru.ac.th` is the university's own domain.

The student server only runs Apache + PHP, so it hosts **only the page**.
`api.php` forwards every API call and uploaded image to the droplet
server-side, so the data, logins and rules are exactly the same as on the main
site. Nothing secret is stored on the student server.

Address: **https://csstu.psru.ac.th/~6212231018/** (routes look like `…/#/book-room`).

## Build

```bash
./deploy/csstu/build.sh 6212231018
```

Produces `deploy/csstu/out/public_html/` and `deploy/csstu/csstu-upload.zip`.
Rebuild and re-upload after frontend changes; `api.php` only changes if the
droplet's addresses do.

## Upload (FTP, e.g. FileZilla)

1. Connect to `csstu.psru.ac.th`, port 21, with the student ID and its password.
2. If there is no `public_html` folder in the home directory, create it.
3. Upload the **contents** of `deploy/csstu/out/public_html/` into `public_html`
   (`index.html`, `api.php`, `check.php`, `assets/`). Replace existing files.

## Check

1. Open https://csstu.psru.ac.th/~6212231018/check.php. It shows which route
   the server can use to reach the API. "ใช้งานได้ ✓" means at least one works.
2. Open https://csstu.psru.ac.th/~6212231018/ and the rooms should load.

`api.php` tries, in order: the sslip.io address, the bare IP, then the Vercel
front door. It only moves on when it cannot connect at all, so a booking that
reached the server is never sent twice.
