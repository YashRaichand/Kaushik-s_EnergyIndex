"""
EDI Platform — Backend Test Suite
Built by Kaushik Digital
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# ─── Test DB ─────────────────────────────────────────────────
TEST_DB_URL = "postgresql+asyncpg://edi_user:edi_password@localhost:5432/edi_test"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as c:
        yield c


@pytest_asyncio.fixture
async def auth_headers(client):
    # Register and login
    await client.post("/api/v1/auth/register", json={
        "email": "test@kaushikdigital.com",
        "password": "testpass123",
        "name": "Test Researcher",
        "role": "researcher",
    })
    resp = await client.post("/api/v1/auth/login", json={
        "email": "test@kaushikdigital.com",
        "password": "testpass123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ─── Health ──────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["built_by"] == "Kaushik Digital"


# ─── Auth ────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_register(client):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "password": "pass123",
        "name": "New User",
        "role": "researcher",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "researcher"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    payload = {"email": "dup@test.com", "password": "p", "name": "Dup", "role": "researcher"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login_invalid(client):
    resp = await client.post("/api/v1/auth/login", json={
        "email": "nobody@test.com", "password": "wrong"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client, auth_headers):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert "email" in resp.json()


# ─── Villages ────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_list_villages(client):
    resp = await client.get("/api/v1/villages/")
    assert resp.status_code == 200
    assert "villages" in resp.json()


@pytest.mark.asyncio
async def test_create_village(client, auth_headers):
    resp = await client.post("/api/v1/villages/", headers=auth_headers, json={
        "name": "Test Village",
        "state": "Odisha",
        "population": 1500,
        "households": 300,
        "electricity_access_pct": 35.0,
        "school_count": 2,
        "hospital_count": 0,
    })
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Village"


# ─── EDS Computation ─────────────────────────────────────────
@pytest.mark.asyncio
async def test_simulate_prediction(client, auth_headers):
    resp = await client.post("/api/v1/predictions/simulate", headers=auth_headers, json={
        "village_name": "Sundarpada",
        "state": "Odisha",
        "population": 1620,
        "households": 380,
        "electricity_access_pct": 24.5,
        "school_count": 2,
        "hospital_count": 0,
        "income_level": 32000,
        "internet_connectivity": 0.08,
        "renewable_energy_pct": 8.0,
        "grid_reliability": 0.3,
        "night_light_intensity": 0.12,
        "literacy_rate": 48.2,
        "female_employment_rate": 18.5,
        "carbon_emissions": 1200,
        "agricultural_productivity": 0.38,
        "mobile_penetration": 0.31,
        "road_connectivity": 0.35,
        "water_access": 0.42,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "scores" in data
    assert 0 <= data["scores"]["eds"] <= 100
    assert len(data["trajectory"]) == 6
    assert len(data["shap_values"]) > 0
    assert "policy" in data


@pytest.mark.asyncio
async def test_eds_score_range(client, auth_headers):
    """EDS should always be 0-100."""
    for elec_pct in [0, 25, 50, 75, 100]:
        resp = await client.post("/api/v1/predictions/simulate", headers=auth_headers, json={
            "village_name": f"Test {elec_pct}%",
            "state": "Test",
            "population": 2000, "households": 500,
            "electricity_access_pct": elec_pct,
            "school_count": 3, "hospital_count": 1,
            "income_level": 50000, "internet_connectivity": 0.2,
            "renewable_energy_pct": 20, "grid_reliability": 0.5,
            "night_light_intensity": 0.3, "literacy_rate": 60,
            "female_employment_rate": 35, "carbon_emissions": 600,
            "agricultural_productivity": 0.5, "mobile_penetration": 0.4,
            "road_connectivity": 0.6, "water_access": 0.55,
        })
        assert resp.status_code == 200
        eds = resp.json()["scores"]["eds"]
        assert 0 <= eds <= 100, f"EDS out of range for {elec_pct}%: {eds}"


# ─── Analytics ───────────────────────────────────────────────
@pytest.mark.asyncio
async def test_dashboard_kpis(client, auth_headers):
    resp = await client.get("/api/v1/analytics/dashboard", headers=auth_headers)
    assert resp.status_code == 200
    assert "kpis" in resp.json()


@pytest.mark.asyncio
async def test_state_rankings(client):
    resp = await client.get("/api/v1/analytics/state-rankings")
    assert resp.status_code == 200
    assert "states" in resp.json()


# ─── Rate Limiting ───────────────────────────────────────────
@pytest.mark.asyncio
async def test_rate_limit_not_triggered_normally(client):
    """Normal usage should not hit rate limit."""
    for _ in range(5):
        resp = await client.get("/health")
        assert resp.status_code == 200
