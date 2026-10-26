from pathlib import Path

from ghar.watch_specials import new_notices, notices


def link(dcd: str, title: str) -> str:
    return f'<a href="view_detail.jsp?lang=0&amp;id=0,4,268&amp;dcd={dcd}&amp;did=1">{title}</a>'


PAGE = "\n".join(
    [
        link("11390", "EASTERN RAILWAY TO RUN TEN PUJA SPECIAL TRAINS"),
        link("11390", "EASTERN RAILWAY TO RUN TEN PUJA SPECIAL TRAINS"),  # listed twice
        link("6084", "04640/04639 छेहरटा-मुजफ्फरपुर त्यौहार विशेष गाड़ी का संचलन"),
        link("11382", "CONTINUATION OF EXTENSION OF EMU SERVICES"),
    ]
)


def test_special_train_notices_are_found_in_english_and_hindi_once_each():
    found = notices("er", PAGE)
    assert [n["id"] for n in found] == ["er-11390", "er-6084"]
    assert found[0]["url"].startswith("https://er.indianrailways.gov.in/view_detail.jsp?")
    assert "&amp;" not in found[0]["url"]


def test_only_notices_not_seen_before_are_new(tmp_path: Path):
    (tmp_path / "er.html").write_text(PAGE, encoding="utf-8")
    assert [n["id"] for n in new_notices(tmp_path, {"er-11390"})] == ["er-6084"]
