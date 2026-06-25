# pytest Reference

Use this reference when writing Python tests with pytest — unit tests, integration tests, async tests, FastAPI API tests, and coverage configuration. For Django/DRF-specific testing (Factory Boy, fixtures, model/serializer/view tests) use [django-drf-testing.md](./django-drf-testing.md) instead.

---

## TDD Methodology

Always follow the **red-green-refactor** cycle when writing Python code:

1. **RED** — write a failing test for the desired behavior before any implementation
2. **GREEN** — write the minimal code needed to make the test pass
3. **REFACTOR** — clean up the code while keeping all tests green

```python
# Step 1: RED — failing test
def test_add_numbers():
    result = add(2, 3)
    assert result == 5

# Step 2: GREEN — minimal implementation
def add(a, b):
    return a + b

# Step 3: REFACTOR — improve without breaking the test
```

**Coverage targets:**

- **General code:** 80%+ coverage
- **Critical paths** (auth, payments, data integrity): 100% coverage required

```bash
pytest --cov=mypackage --cov-report=term-missing --cov-report=html --cov-fail-under=80
```

---

## Installation

```bash
# Core pytest
pip install pytest

# Common plugins
pip install pytest pytest-cov pytest-asyncio pytest-mock

# For FastAPI testing
pip install pytest httpx pytest-asyncio

# For Django testing
pip install pytest pytest-django

# For async databases
pip install pytest-asyncio aiosqlite

# For parallel execution
pip install pytest-xdist
```

---

## Basic Test Patterns

### Simple test functions

```python
def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
```

### Test classes for grouping related tests

```python
class TestCalculator:
    def test_add(self):
        calc = Calculator()
        assert calc.add(2, 3) == 5

    def test_multiply(self):
        calc = Calculator()
        assert calc.multiply(4, 5) == 20
```

### Assertions and exceptions

```python
import pytest

# Test exception
def test_divide_by_zero():
    with pytest.raises(ValueError, match="Cannot divide by zero"):
        divide(10, 0)

# Approximate equality
def test_float_comparison():
    assert 0.1 + 0.2 == pytest.approx(0.3)
```

**Run commands:**

```bash
pytest                          # All tests
pytest -v                       # Verbose
pytest -s                       # Show print output
pytest test_math.py             # Single file
pytest test_math.py::test_add   # Single function
```

---

## Fixtures

### Basic fixtures

```python
# conftest.py
import pytest

@pytest.fixture
def sample_data():
    return {"name": "Alice", "age": 30, "email": "alice@example.com"}

# test_fixtures.py
def test_sample_data(sample_data):
    assert sample_data["name"] == "Alice"
```

### Fixture scopes

```python
@pytest.fixture(scope="function")   # Default — runs for each test
def user():
    return {"id": 1, "name": "Alice"}

@pytest.fixture(scope="class")      # Once per test class
def database():
    db = setup_database()
    yield db
    db.close()

@pytest.fixture(scope="module")     # Once per test module
def api_client():
    client = APIClient()
    yield client
    client.shutdown()

@pytest.fixture(scope="session")    # Once for the entire test run
def app_config():
    return load_config()
```

### Setup and teardown with `yield`

```python
@pytest.fixture
def temp_directory():
    temp_dir = tempfile.mkdtemp()
    yield temp_dir          # Test receives the value
    shutil.rmtree(temp_dir) # Teardown runs after yield
```

### Fixture dependencies

```python
@pytest.fixture
def database_connection():
    conn = connect_to_db()
    yield conn
    conn.close()

@pytest.fixture
def database_session(database_connection):
    session = create_session(database_connection)
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def user_repository(database_session):
    return UserRepository(database_session)

def test_create_user(user_repository):
    user = user_repository.create(name="Alice", email="alice@example.com")
    assert user.name == "Alice"
```

### Monkeypatch

Built-in pytest fixture for patching environment variables, object attributes, and dictionary entries — automatically reverted after each test, no cleanup needed.

```python
def get_database_url() -> str:
    return os.environ.get("DATABASE_URL", "sqlite:///:memory:")


def test_custom_database_url(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
    assert get_database_url() == "postgresql://localhost/test"


def test_no_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert get_database_url() == "sqlite:///:memory:"


def test_monkeypatch_attribute(monkeypatch):
    config = Config()
    monkeypatch.setattr(config, "api_key", "test-key")
    assert config.get_api_key() == "test-key"
```

### Autouse fixtures

Run automatically before every test in scope without being explicitly requested.

```python
@pytest.fixture(autouse=True)
def reset_config():
    """Runs before (and after) every test automatically."""
    Config.reset()
    yield
    Config.cleanup()

def test_without_fixture_arg():
    # reset_config runs automatically — no argument needed
    assert Config.get_setting("debug") is False
```

Useful inside a test class to replace `setUp`/`tearDown`:

```python
class TestUserService:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.service = UserService()

    def test_create_user(self):
        user = self.service.create_user("Alice")
        assert user.name == "Alice"

    def test_delete_user(self):
        user = User(id=1, name="Bob")
        self.service.delete_user(user)
        assert not self.service.user_exists(1)
```

---

## Parametrization

### Basic

```python
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (5, 7, 12),
    (-1, 1, 0),
    (0, 0, 0),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected
```

### With explicit IDs

```python
@pytest.mark.parametrize("input_data,expected", [
    pytest.param({"name": "Alice"}, "Alice", id="valid_name"),
    pytest.param({"name": ""}, None,         id="empty_name"),
    pytest.param({}, None,                   id="missing_name"),
])
def test_extract_name(input_data, expected):
    assert extract_name(input_data) == expected
```

### Indirect parametrization (through fixtures)

```python
@pytest.fixture
def user_data(request):
    return {"name": request.param, "email": f"{request.param}@example.com"}

@pytest.mark.parametrize("user_data", ["Alice", "Bob", "Charlie"], indirect=True)
def test_user_creation(user_data):
    assert "@example.com" in user_data["email"]
```

### Parametrized fixtures with `params`

Define parameters on the fixture itself so every test that uses the fixture automatically runs against all variants — no `@pytest.mark.parametrize` needed on the test.

```python
@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def db_backend(request):
    """Each test using this fixture runs 3 times — once per backend."""
    return request.param

def test_connection_string(db_backend):
    # Runs once for sqlite, once for postgresql, once for mysql
    assert db_backend in ["sqlite", "postgresql", "mysql"]


# Combine with setup/teardown
@pytest.fixture(params=["v1", "v2"])
def api_client(request):
    client = APIClient(version=request.param)
    yield client
    client.close()

def test_api_response(api_client):
    response = api_client.get("/health")
    assert response.status_code == 200
```

Use fixture `params` when the variation is about *the environment* (database backend, API version, locale). Use `@pytest.mark.parametrize` when the variation is about *the data* passed to the test logic.

---

## Markers

### Built-in markers

```python
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="Unix-only")
def test_unix_specific():
    pass

@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug():
    assert False
```

### Custom markers (register in `pytest.ini`)

```ini
# pytest.ini
[pytest]
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
    smoke: marks tests as smoke tests
```

```python
@pytest.mark.unit
def test_fast_unit():
    assert True

@pytest.mark.integration
@pytest.mark.slow
def test_slow_integration():
    pass
```

**Run by marker:**

```bash
pytest -m unit
pytest -m "not slow"
pytest -m integration
pytest -m "unit or integration"
pytest -m smoke
```

---

## FastAPI Testing

### Sync test client

```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

# test_api.py
def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_item_not_found(client):
    response = client.get("/items/0")
    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}
```

### Async test client

```python
# conftest.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

# test_async_api.py
@pytest.mark.asyncio
async def test_read_root_async(async_client):
    response = await async_client.get("/")
    assert response.status_code == 200
```

### FastAPI with database (override dependency)

```python
# conftest.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(test_db):
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
```

---

## Mocking with pytest-mock

### Patch a function

```python
def test_get_user_data(mocker):
    mock_response = mocker.Mock()
    mock_response.json.return_value = {"id": 1, "name": "Alice"}
    mocker.patch("requests.get", return_value=mock_response)

    result = get_user_data(1)
    assert result["name"] == "Alice"
```

### Patch a method on an instance

```python
def test_get_user_name(mocker):
    service = UserService()
    mocker.patch.object(service, "get_user", return_value={"id": 1, "name": "Alice"})

    result = service.get_user_name(1)
    assert result == "Alice"
```

### Side effects (sequence of return values)

```python
def test_retry_on_failure(mocker):
    mock_api = mocker.patch("requests.get")
    mock_api.side_effect = [
        requests.exceptions.Timeout(),
        mocker.Mock(json=lambda: {"status": "ok"}),
    ]

    result = api_call_with_retry()
    assert result["status"] == "ok"
    assert mock_api.call_count == 2
```

### Spy on calls without replacing behavior

```python
def test_function_called_correctly(mocker):
    spy = mocker.spy(module, "function_name")
    module.run_workflow()
    spy.assert_called_once_with(arg1="value", arg2=42)
```

---

## Mocking with unittest.mock

Use `unittest.mock` directly when not using pytest-mock, or when you need `@patch` as a decorator.

### Patch a function with `@patch`

```python
from unittest.mock import patch, Mock

@patch("mypackage.external_api_call")
def test_with_mock(api_call_mock):
    api_call_mock.return_value = {"status": "success"}
    result = my_function()
    api_call_mock.assert_called_once()
    assert result["status"] == "success"
```

### Side effects (exceptions, sequences)

```python
@patch("mypackage.api_call")
def test_api_error_handling(api_call_mock):
    api_call_mock.side_effect = ConnectionError("Network error")
    with pytest.raises(ConnectionError):
        api_call()
```

### Mock file I/O with `mock_open`

```python
from unittest.mock import patch, mock_open

@patch("builtins.open", new_callable=mock_open)
def test_file_reading(mock_file):
    mock_file.return_value.read.return_value = "file content"
    result = read_file("test.txt")
    mock_file.assert_called_once_with("test.txt", "r")
    assert result == "file content"
```

### `autospec` — catch API misuse

```python
@patch("mypackage.DBConnection", autospec=True)
def test_autospec(db_mock):
    db = db_mock.return_value
    db.query("SELECT * FROM users")
    db_mock.assert_called_once()
    # autospec fails if DBConnection.query doesn't exist or receives wrong args
```

### Mock properties with `PropertyMock`

```python
from unittest.mock import Mock, PropertyMock

@pytest.fixture
def mock_config():
    config = Mock()
    type(config).debug = PropertyMock(return_value=True)
    type(config).api_key = PropertyMock(return_value="test-key")
    return config

def test_with_mock_config(mock_config):
    assert mock_config.debug is True
    assert mock_config.api_key == "test-key"
```

### MagicMock and context manager mocks

`MagicMock` supports magic methods (`__enter__`, `__exit__`, `__len__`, etc.) automatically — prefer it over `Mock` when the thing being mocked has magic method usage.

```python
from unittest.mock import Mock, MagicMock, patch

def test_get_user_success():
    client = APIClient("https://api.example.com")

    mock_response = Mock()
    mock_response.json.return_value = {"id": 1, "name": "John Doe"}
    mock_response.raise_for_status.return_value = None

    with patch("requests.get", return_value=mock_response) as mock_get:
        user = client.get_user(1)

        assert user["id"] == 1
        mock_get.assert_called_once_with("https://api.example.com/users/1")


@patch("requests.post")
def test_create_user(mock_post):
    mock_post.return_value.json.return_value = {"id": 2, "name": "Jane"}
    mock_post.return_value.raise_for_status.return_value = None

    client = APIClient("https://api.example.com")
    result = client.create_user({"name": "Jane", "email": "jane@example.com"})

    assert result["id"] == 2
    # Inspect kwargs passed to the mock
    call_args = mock_post.call_args
    assert call_args.kwargs["json"]["name"] == "Jane"
```

### Retry behavior testing

Use `side_effect` with a list to simulate fail-then-succeed sequences:

```python
def test_retries_on_transient_error():
    client = Mock()
    client.request.side_effect = [
        ConnectionError("Failed"),
        ConnectionError("Failed"),
        {"status": "ok"},
    ]
    service = ServiceWithRetry(client, max_retries=3)
    result = service.fetch()
    assert result == {"status": "ok"}
    assert client.request.call_count == 3


def test_gives_up_after_max_retries():
    client = Mock()
    client.request.side_effect = ConnectionError("Failed")
    service = ServiceWithRetry(client, max_retries=3)
    with pytest.raises(ConnectionError):
        service.fetch()
    assert client.request.call_count == 3


def test_does_not_retry_on_permanent_error():
    client = Mock()
    client.request.side_effect = ValueError("Invalid input")
    service = ServiceWithRetry(client, max_retries=3)
    with pytest.raises(ValueError):
        service.fetch()
    assert client.request.call_count == 1  # no retry for non-transient errors
```

### Async mocking

```python
@pytest.mark.asyncio
@patch("mypackage.async_api_call")
async def test_async_mock(api_call_mock):
    api_call_mock.return_value = {"status": "ok"}
    result = await my_async_function()
    api_call_mock.assert_awaited_once()
    assert result["status"] == "ok"
```

---

## Testing File Operations

### `tmp_path` (preferred — `pathlib.Path`)

```python
def test_with_tmp_path(tmp_path):
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello world")

    result = process_file(str(test_file))
    assert result == "hello world"
    # tmp_path cleaned up automatically after the test
```

### `tmpdir` (legacy — `py.path.local`)

```python
def test_with_tmpdir(tmpdir):
    test_file = tmpdir.join("test.txt")
    test_file.write("data")

    result = process_file(str(test_file))
    assert result == "data"
```

### `tempfile` for explicit control

```python
import tempfile, os

def test_file_processing():
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt") as f:
        f.write("test content")
        temp_path = f.name
    try:
        result = process_file(temp_path)
        assert result == "processed: test content"
    finally:
        os.unlink(temp_path)
```

---

## Freezing Time with freezegun

Use `freezegun` to make time-dependent tests deterministic. Freezes `datetime.now()`, `datetime.utcnow()`, `time.time()`, and `date.today()` in the decorated scope.

```bash
pip install freezegun
```

```python
from freezegun import freeze_time
from datetime import datetime

@freeze_time("2026-01-15 10:00:00")
def test_token_expiry():
    token = create_token(expires_in_seconds=3600)
    assert token.expires_at == datetime(2026, 1, 15, 11, 0, 0)


@freeze_time("2026-01-15 10:00:00")
def test_is_not_expired_before_expiry():
    token = create_token(expires_in_seconds=3600)
    assert not token.is_expired()


@freeze_time("2026-01-15 12:00:00")
def test_is_expired_after_expiry():
    token = Token(expires_at=datetime(2026, 1, 15, 11, 30, 0))
    assert token.is_expired()


def test_with_time_travel():
    with freeze_time("2026-01-01") as frozen_time:
        item = create_item()
        assert item.created_at == datetime(2026, 1, 1)
        frozen_time.move_to("2026-01-15")
        assert item.age_days == 14
```

---

## Property-Based Testing (Hypothesis)

Property-based tests generate hundreds of random inputs automatically and find edge cases you wouldn't think to write manually.

```bash
pip install hypothesis
```

```python
from hypothesis import given, strategies as st


@given(st.text())
def test_reverse_twice_is_original(s):
    """Reversing a string twice returns the original."""
    assert s[::-1][::-1] == s


@given(st.text())
def test_reverse_preserves_length(s):
    assert len(s[::-1]) == len(s)


@given(st.integers(), st.integers())
def test_addition_is_commutative(a, b):
    assert a + b == b + a


@given(st.lists(st.integers()))
def test_sorted_list_properties(lst):
    result = sorted(lst)
    assert len(result) == len(lst)
    assert set(result) == set(lst)
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1]
```

Hypothesis shrinks failing examples to the smallest input that reproduces the failure.

---

## Testing Database Operations (SQLAlchemy)

Standard pattern for in-memory test databases — avoids touching production or integration databases.

```python
import pytest
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    email = Column(String(100), unique=True)


@pytest.fixture(scope="function")
def db_session() -> Session:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def test_create_user(db_session):
    user = User(name="Test User", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    assert user.id is not None


def test_query_users(db_session):
    db_session.add_all([
        User(name="User 1", email="u1@example.com"),
        User(name="User 2", email="u2@example.com"),
    ])
    db_session.commit()
    assert db_session.query(User).count() == 2


def test_unique_email_constraint(db_session):
    from sqlalchemy.exc import IntegrityError
    db_session.add(User(name="A", email="same@example.com"))
    db_session.commit()
    db_session.add(User(name="B", email="same@example.com"))
    with pytest.raises(IntegrityError):
        db_session.commit()
```

For Django ORM, see [django-drf-testing.md](./django-drf-testing.md).
For FastAPI + SQLAlchemy dependency override, see the FastAPI section above.

---

## Coverage

### CLI flags

```bash
pytest --cov=app --cov-report=term-missing   # Terminal with missing lines
pytest --cov=app --cov-report=html           # HTML report → htmlcov/
pytest --cov=app --cov-report=xml            # XML for CI
pytest --cov=app --cov-fail-under=80         # Fail if below 80%
pytest --cov --cov-report=annotate:cov_annotate   # Annotated source files
```

### Annotate report — iterative 100% coverage workflow

The annotate format writes one annotated source file per module into `cov_annotate/`. Every line that is **not covered** is prefixed with `!`. This is the most efficient format for systematically closing coverage gaps.

**Workflow:**

```bash
# 1. Generate annotated report (whole project)
pytest --cov --cov-report=annotate:cov_annotate

# 2. Scope to a single module
pytest --cov=your_module_name --cov-report=annotate:cov_annotate

# 3. Scope to a specific test file + module
pytest tests/test_your_module.py --cov=your_module_name --cov-report=annotate:cov_annotate
```

**Reading the output:**

- Files with **100% coverage** need no action — skip them.
- For each file below 100%, open the matching file in `cov_annotate/`.
- Lines starting with `!` are not covered — add tests to cover them.
- Re-run until all `!` lines are gone.

```
# example annotated line — covered
  def process(data):

# example annotated line — NOT covered (starts with !)
!     raise ValueError("unexpected input")
```

**Goal:** keep iterating until every file in `cov_annotate/` has no `!` lines.

### `pytest.ini` configuration

```ini
[pytest]
addopts =
    --cov=app
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
    -v
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
markers =
    slow: marks tests as slow
    integration: marks integration tests
    unit: marks unit tests
    e2e: marks end-to-end tests
```

### `pyproject.toml` configuration

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = [
    "-v",
    "--strict-markers",
    "--tb=short",
    "--cov=myapp",
    "--cov-report=term-missing",
]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
    "unit: marks unit tests",
    "e2e: marks end-to-end tests",
]

[tool.coverage.run]
source = ["myapp"]
omit = ["*/tests/*", "*/migrations/*"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
]
```

---

## Async Testing

### pytest-asyncio

```python
# conftest.py
# Enable asyncio mode in pytest.ini:
# [pytest]
# asyncio_mode = auto

# test_async_service.py
import pytest

@pytest.mark.asyncio
async def test_fetch_data(mocker):
    mock_response = mocker.AsyncMock()
    mock_response.json.return_value = {"data": "test"}

    mock_session = mocker.AsyncMock()
    mock_session.__aenter__.return_value.get.return_value.__aenter__.return_value = mock_response
    mocker.patch("aiohttp.ClientSession", return_value=mock_session)

    result = await fetch_data("https://api.example.com/data")
    assert result["data"] == "test"
```

### Concurrent async operations

```python
@pytest.mark.asyncio
async def test_concurrent_fetches():
    urls = ["url1", "url2", "url3"]
    results = await asyncio.gather(*[fetch_data(url) for url in urls])
    assert len(results) == 3
    assert all("data" in r for r in results)
```

### Async fixtures

```python
@pytest.fixture
async def async_db_session():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(async_engine) as session:
        yield session
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_create_user_async(async_db_session):
    user = User(email="test@example.com", name="Test")
    async_db_session.add(user)
    await async_db_session.commit()

    result = await async_db_session.execute(
        select(User).where(User.email == "test@example.com")
    )
    assert result.scalar_one().name == "Test"
```

---

## Test Organization

Recommended directory layout for Python projects:

```
tests/
├── conftest.py              # Shared fixtures — available to all tests automatically
├── test_unit/               # Fast, isolated, no I/O
│   ├── test_models.py
│   └── test_utils.py
├── test_integration/        # Tests that cross component boundaries
│   ├── test_api.py
│   └── test_database.py
└── test_e2e/                # Full-stack or end-to-end workflows
    └── test_workflows.py
```

- Place `conftest.py` at the level where fixtures should be discoverable — repo root, package root, or a specific sub-directory.
- Name test files `test_*.py` and test functions `test_*` so pytest discovers them automatically.
- Prefer `test_unit/`, `test_integration/`, `test_e2e/` subdirectories over marker-only organization when suites are large enough to benefit from independent runs.

---

## Parallel Execution

```bash
pip install pytest-xdist

pytest -n auto          # All CPU cores
pytest -n 4             # 4 workers
pytest -n auto --dist=loadfile  # Group tests by file
```

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
          pip install pytest pytest-cov

      - name: Run tests
        run: pytest --cov=myapp --cov-report=xml --cov-fail-under=80

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
```

---

## Best Practices

### 1. Arrange-Act-Assert

```python
def test_user_service_creates_user():
    # Arrange
    service = UserService(database=mock_db)
    user_data = {"email": "test@example.com", "name": "Test"}

    # Act
    result = service.create_user(user_data)

    # Assert
    assert result.email == "test@example.com"
    assert result.id is not None
```

### 2. One assertion focus per test

```python
# ✅ Each test focuses on one behavior
def test_user_creation():
    user = create_user()
    assert user.id is not None

def test_user_update():
    user = create_user()
    updated = update_user(user.id, name="New Name")
    assert updated.name == "New Name"
```

### 3. Prefer fixtures over repeated setup

```python
# ✅ Fixture-based
@pytest.fixture
def db():
    database = setup_database()
    yield database
    database.close()

@pytest.fixture
def user(db):
    return create_user(db)

def test_user_creation(user):
    assert user.id is not None
```

### 4. Use parametrize for similar cases

```python
# ✅ Single parametrized test
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (-2, -3, -5),
    (0, 0, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

### 5. Descriptive test names

A common pattern: `test_<unit>_<scenario>_<expected_outcome>`.

```python
# ✅ Clear intent — scenario + expected outcome
def test_create_user_with_valid_data_returns_user(): ...
def test_create_user_with_duplicate_email_raises_conflict(): ...
def test_get_user_with_unknown_id_raises_not_found(): ...
def test_login_fails_with_invalid_password(): ...
def test_api_returns_404_for_missing_resource(): ...

# ❌ Vague
def test_user1(): ...
def test_case2(): ...
def test_user(): ...
def test_function(): ...
```

### 6. Test error paths

Always test failure cases, not just the happy path.

```python
def test_get_user_raises_not_found():
    with pytest.raises(UserNotFoundError) as exc_info:
        service.get_user("nonexistent-id")
    assert "nonexistent-id" in str(exc_info.value)


def test_create_user_rejects_invalid_email():
    with pytest.raises(ValueError, match="Invalid email format"):
        service.create_user({"email": "not-an-email"})
```

### 7. One behavior per test

Each test verifies exactly one behavior. Multi-behavior tests are harder to diagnose when they fail.

```python
# ❌ Multiple behaviors in one test
def test_user_service():
    user = service.create_user(data)
    assert user.id is not None
    assert user.email == data["email"]
    updated = service.update_user(user.id, {"name": "New"})
    assert updated.name == "New"

# ✅ Focused tests
def test_create_user_assigns_id():
    user = service.create_user(data)
    assert user.id is not None

def test_create_user_stores_email():
    user = service.create_user(data)
    assert user.email == data["email"]

def test_update_user_changes_name():
    user = service.create_user(data)
    updated = service.update_user(user.id, {"name": "New"})
    assert updated.name == "New"
```

---

## Common Pitfalls

### Test depends on execution order

```python
# ❌ Shared mutable state across tests
class TestUserWorkflow:
    user_id = None
    def test_create_user(self):
        TestUserWorkflow.user_id = create_user().id
    def test_update_user(self):
        update_user(TestUserWorkflow.user_id, name="New")  # Fails if order changes

# ✅ Use fixtures
@pytest.fixture
def created_user():
    return create_user()

def test_update_user(created_user):
    update_user(created_user.id, name="New")
```

### Resource leak (no teardown)

```python
# ❌ DB connection not closed
def test_user_creation():
    db = setup_database()
    user = create_user(db)
    assert user.id is not None

# ✅ Use yield fixture for cleanup
@pytest.fixture
def db():
    database = setup_database()
    yield database
    database.close()
```

### Testing implementation details

```python
# ❌ Testing internal cache state
def test_user_service_uses_cache():
    service = UserService()
    service.get_user(1)
    assert service._cache.has_key(1)

# ✅ Test observable behavior
def test_user_service_returns_user():
    service = UserService()
    user = service.get_user(1)
    assert user.id == 1
```

### Using unittest assertions instead of pytest

```python
# ❌ Verbose unittest style
unittest.TestCase().assertEqual(result, 5)

# ✅ Plain assert with rich introspection
assert result == 5
```

### Overly complex fixtures

```python
# ❌ Fixture doing too much
@pytest.fixture
def everything():
    db = setup_db()
    user = create_user(db)
    session = login(user)
    ...

# ✅ Composable fixtures
@pytest.fixture
def db(): ...
@pytest.fixture
def user(db): ...
@pytest.fixture
def session(user): ...
```

---

## Quick Reference

| Pattern | Usage |
|---------|-------|
| `pytest.raises(Err)` | Assert expected exception |
| `pytest.raises(Err, match="msg")` | Assert exception + message |
| `pytest.approx(0.3)` | Float comparison with tolerance |
| `@pytest.fixture` | Reusable setup/teardown |
| `@pytest.fixture(autouse=True)` | Auto-run fixture for every test in scope |
| `@pytest.fixture(scope="session")` | Run fixture once for entire test session |
| `@pytest.mark.parametrize` | Run test with multiple input sets |
| `@pytest.mark.skip` / `skipif` | Skip a test unconditionally / conditionally |
| `@pytest.mark.xfail` | Mark known-failing test |
| `@patch("module.name")` | Replace object at import path (unittest.mock) |
| `mocker.patch(...)` | Replace object (pytest-mock) |
| `mocker.spy(obj, "method")` | Observe calls without replacing behavior |
| `mocker.AsyncMock()` | Async-aware mock (pytest-mock) |
| `MagicMock()` | Mock with magic method support (`__enter__`, `__len__`, etc.) |
| `monkeypatch.setenv("K","V")` | Patch env var, auto-reverted after test |
| `monkeypatch.setattr(obj, "attr", val)` | Patch object attribute, auto-reverted |
| `@freeze_time("2026-01-15")` | Freeze `datetime.now()` / `time.time()` |
| `@given(st.text())` | Property-based test (Hypothesis) |
| `tmp_path` fixture | Auto-cleanup temp directory (`pathlib.Path`) |
| `pytest --cov=pkg` | Measure coverage |
| `pytest --cov-fail-under=80` | Fail CI if coverage drops below threshold |
| `pytest --cov-report=annotate:dir` | Annotated source — `!` marks uncovered lines |
| `pytest -n auto` | Parallel execution (pytest-xdist) |
| `pytest --lf` | Re-run only last-failed tests |
| `pytest --pdb` | Drop into debugger on failure |
| `pytest -k "pattern"` | Run tests whose name matches pattern |
