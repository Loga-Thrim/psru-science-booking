# Seed data

`seed.sh` loads the faculty's rooms (`rooms.json`), creates the admin account
(`create-admin.js`) and adds one sample booking (`seed-reservations.js`).
Run `RESET=1 ./seed/seed.sh` to wipe all rooms, bookings and users first.

## Where the room data comes from

The faculty does not publish a room list, so `rooms.json` mixes what could be
confirmed with sample values. Replace the samples with the faculty office's
real list (0 5526 7054, scitech@psru.ac.th) when it is available.

The building list in the room forms (`BUILDINGS` in front-end/src/types/types.ts)
is the faculty office's own list of its 9 buildings (received 2026-11-10).

Confirmed from public sources (checked 2026-11-09):

| Item | Source |
| --- | --- |
| Campus: ทะเลแก้ว, 156 หมู่ 5 ต.พลายชุมพล อ.เมือง จ.พิษณุโลก | science.psru.ac.th/contact |
| Faculty phone 0 5526 7054 (used as every room's contact) | science.psru.ac.th/contact |
| อาคารวิทยาศาสตร์ 2 (SC2) | science.psru.ac.th news, 2024-04-10 |
| Room SC2401 used for faculty meetings and MOU signings | psru.ac.th news, 2025-03-10 |
| อาคารคหกรรมศาสตร์ ชั้น 2 used for food / chef training | psru.ac.th news, 2026-05-12 |
| อาคารปฏิบัติการสาธารณสุขศาสตร์ | science.psru.ac.th/history, registrar's building map |
| Programmes (computer science, IT, chemistry, biology, microbiology, physics, home economics, public health, spa) | science.psru.ac.th/courses-offered |

**Sample values (not confirmed):** every room code other than SC2401, all
floors other than SC2401 and HE201, every capacity, every equipment list,
opening hours and booking rules. Caretakers are department or office names,
not people.

The sample booking uses a fictional name, because booker names are shown
publicly on taken time slots.
