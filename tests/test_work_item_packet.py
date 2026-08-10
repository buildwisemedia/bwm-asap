from pathlib import Path


PACKET = (
    Path(__file__).parents[1]
    / "work-item-packets"
    / "5266adf9-1155-43c5-b55d-01e29a466840.md"
)


def test_tier_drift_packet_routes_to_the_canonical_renderer():
    text = PACKET.read_text()

    assert "Status: `ready-for-reroute`" in text
    assert "skills/client-performance-report/run.py" in text
    assert '`"ascend": "ascend-pro"`' in text
    assert "no production renderer change was made" in text


def test_tier_drift_packet_pins_the_regression_matrix():
    text = PACKET.read_text()
    normalized_text = " ".join(text.split())

    expected_rows = (
        "| `ascend` | `ascend` |",
        "| `ascend-pro` | `ascend-pro` |",
        "| `pilot` | `ascend-pilot` |",
        "| `ascend_lite` | `ascend` |",
    )
    assert all(row in text for row in expected_rows)
    assert (
        "Preserve the still-valid `pilot` and `ascend_lite` aliases."
        in normalized_text
    )
