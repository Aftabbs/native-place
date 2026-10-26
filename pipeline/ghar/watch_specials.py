"""Watch the zonal railways' press-release pages for new festival-special notices.

A notice still has to be read and transcribed into data/specials/specials-2026.csv by
hand; this only makes sure none is missed. It lists notices not seen before, so a daily
job can open an issue for them.

python -m ghar.watch_specials <folder of downloaded index pages>   # prints new notices
python -m ghar.watch_specials <folder> --record                    # also marks them seen
"""

from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEEN = ROOT / "data" / "specials" / "seen-notices.json"

# Zone subdomain -> its press-release section. ECR publishes none on its site.
ZONES = {
    "nr": "0,4,268",
    "ner": "0,4,268",
    "er": "0,4,268",
    "nfr": "0,4,268",
    "swr": "0,4,268",
    "cr": "0,4,268",
    "wr": "0,4,268",
    "scr": "0,5,268",
    "ser": "0,4,423",
    "sr": "0,4,268",
}

# English and Hindi words that mark a special-train notice.
SPECIAL = re.compile(
    r"special|puja|chhath|diwali|deepawali|festival|विशेष गाड़ी|त्यौहार|त्योहार|पूजा|छठ|दीपावली",
    re.IGNORECASE,
)
LINK = re.compile(r'<a[^>]+href="([^"]*view_detail[^"]*)"[^>]*>(.*?)</a>', re.DOTALL)


def index_url(zone: str) -> str:
    return f"https://{zone}.indianrailways.gov.in/view_section.jsp?lang=0&id={ZONES[zone]}"


def notices(zone: str, page: str) -> list[dict]:
    """Special-train notices on one zone's press-release index page."""
    out, seen = [], set()
    for href, label in LINK.findall(page):
        title = " ".join(html.unescape(re.sub(r"<[^>]+>", "", label)).split())
        number = re.search(r"dcd=(\d+)", href)
        if not number or number.group(1) in seen or not SPECIAL.search(title):
            continue
        seen.add(number.group(1))
        url = html.unescape(href)
        if not url.startswith("http"):
            url = f"https://{zone}.indianrailways.gov.in/{url.lstrip('/')}"
        out.append({"id": f"{zone}-{number.group(1)}", "zone": zone, "title": title, "url": url})
    return out


def new_notices(folder: Path, seen: set[str]) -> list[dict]:
    found = []
    for zone in ZONES:
        page = folder / f"{zone}.html"
        if page.exists():
            text = page.read_text(encoding="utf-8", errors="replace")
            found += [n for n in notices(zone, text) if n["id"] not in seen]
    return found


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    sys.stdout.reconfigure(encoding="utf-8")  # Hindi titles, on any console
    seen = set(json.loads(SEEN.read_text(encoding="utf-8"))) if SEEN.exists() else set()
    found = new_notices(Path(sys.argv[1]), seen)
    for n in found:
        print(f"- [ ] **{n['zone'].upper()}** {n['title']}\n  {n['url']}")
    if "--record" in sys.argv:
        text = json.dumps(sorted(seen | {n["id"] for n in found}), indent=1) + "\n"
        SEEN.write_bytes(text.encode("utf-8"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
