"""Watch the zonal railways' press-release pages for new festival-special notices.

A notice still has to be read and transcribed into data/specials/specials-2026.csv by
hand; this only makes sure none is missed. It lists notices not seen before.

The railway sites refuse connections from cloud servers (GitHub Actions times out), so
this runs from an ordinary connection, once a day.

python -m ghar.watch_specials --fetch            # download the indexes, print new notices
python -m ghar.watch_specials --fetch --issue    # and keep a GitHub issue listing them
python -m ghar.watch_specials <folder>           # read already downloaded indexes
python -m ghar.watch_specials <folder> --record  # mark what is listed as seen
"""

from __future__ import annotations

import html
import json
import re
import subprocess
import sys
import tempfile
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


ISSUE_TITLE = "New special-train notices to check"


def fetch(folder: Path) -> list[str]:
    """Download each zone's index with curl (Python's TLS fails on some of these servers).
    Returns the zones that could not be fetched."""
    failed = []
    for zone in ZONES:
        out = folder / f"{zone}.html"
        cmd = ["curl", "-sS", "-m", "60", "-A", "Mozilla/5.0", "-o", str(out), index_url(zone)]
        if subprocess.run(cmd, capture_output=True).returncode != 0:
            failed.append(zone)
    return failed


def update_issue(lines: list[str]) -> None:
    """Keep one open issue listing the notices still to read."""
    body = "\n".join(
        [
            "Festival-special notices on the zonal railway sites that are not yet in the data.",
            "Read each one, add its trains to `data/specials/specials-2026.csv`, then run",
            "`python -m ghar.watch_specials <folder> --record` and close this issue.",
            "",
            *lines,
        ]
    )
    search = ["gh", "issue", "list", "--state", "open", "--search", f'in:title "{ISSUE_TITLE}"']
    found = subprocess.run(
        [*search, "--json", "number", "--jq", ".[0].number"], capture_output=True, text=True
    )
    number = found.stdout.strip()
    if number:
        subprocess.run(["gh", "issue", "edit", number, "--body", body], check=True, cwd=ROOT)
    else:
        subprocess.run(
            ["gh", "issue", "create", "--title", ISSUE_TITLE, "--body", body], check=True, cwd=ROOT
        )


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args and "--fetch" not in sys.argv:
        print(__doc__)
        return 2
    sys.stdout.reconfigure(encoding="utf-8")  # Hindi titles, on any console
    seen = set(json.loads(SEEN.read_text(encoding="utf-8"))) if SEEN.exists() else set()
    folder = Path(args[0]) if args else Path(tempfile.mkdtemp(prefix="zones-"))
    if "--fetch" in sys.argv:
        for zone in fetch(folder):
            print(f"could not fetch {zone}", file=sys.stderr)
    found = new_notices(folder, seen)
    lines = [f"- [ ] **{n['zone'].upper()}** {n['title']}\n  {n['url']}" for n in found]
    for line in lines:
        print(line)
    if "--issue" in sys.argv and lines:
        update_issue(lines)
    if "--record" in sys.argv:
        text = json.dumps(sorted(seen | {n["id"] for n in found}), indent=1) + "\n"
        SEEN.write_bytes(text.encode("utf-8"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
