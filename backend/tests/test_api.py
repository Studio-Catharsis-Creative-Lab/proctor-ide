def _auth(role: str) -> dict[str, str]:
    return {"Authorization": f"Bearer dev-{role}"}


def test_activity_create_and_list(client):
    payload = {
        "title": "Intro Assignment",
        "type": "assignment",
        "description": "Solve basics.",
        "tracking_level": "moderate",
    }
    create = client.post("/api/activities", json=payload, headers=_auth("instructor"))
    assert create.status_code == 200
    created_id = create.json()["id"]

    listing = client.get("/api/activities", headers=_auth("instructor"))
    assert listing.status_code == 200
    ids = [item["id"] for item in listing.json()]
    assert created_id in ids


def test_invitation_lifecycle(client):
    create = client.post(
        "/api/invitations",
        json={"email": "student@example.com", "role": "student"},
        headers=_auth("instructor"),
    )
    assert create.status_code == 200
    code = create.json()["code"]

    validate = client.get(f"/api/invitations/validate/{code}")
    assert validate.status_code == 200
    assert validate.json()["valid"] is True

    redeem = client.post("/api/invitations/redeem", json={"code": code}, headers=_auth("student"))
    assert redeem.status_code == 200
    assert redeem.json()["status"] == "redeemed"


def test_tracking_events_persist(client):
    create = client.post(
        "/api/activities",
        json={"title": "Track Test", "type": "quiz", "description": "", "tracking_level": "basic"},
        headers=_auth("instructor"),
    )
    activity_id = create.json()["id"]

    payload = [
        {
            "student_id": "spoofed-student",
            "activity_id": str(activity_id),
            "event_type": "keystroke_batch",
            "event_data": {"chars": 12},
        }
    ]
    ingest = client.post("/api/tracking/events", json=payload, headers=_auth("student"))
    assert ingest.status_code == 200
    assert ingest.json()["accepted"] == 1

    listing = client.get("/api/tracking/events", headers=_auth("instructor"))
    assert listing.status_code == 200
    items = listing.json()
    assert any(item["event_type"] == "keystroke_batch" for item in items)
    assert any(item["event_type"] == "keystroke_batch" and item["student_id"] is not None for item in items)


def test_workspace_path_traversal_rejected(client):
    response = client.put(
        "/api/workspace/w1/files/%2e%2e/outside.py",
        json={"content": "print('x')"},
        headers=_auth("student"),
    )
    assert response.status_code == 400
