# 🤖 GitHub Copilot - Project Instructions

## 📁 **Project Structure Requirements**

This is a **full-stack QR Loyalty Platform** with **React Native/Expo TypeScript frontend** and **FastAPI Python backend**. Always maintain and follow these folder structures:

### **🔧 BACKEND (FastAPI Python)**

This is a **FastAPI Python** project following domain-driven design principles. Always maintain and follow this folder structure:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── core/                      # Core application configuration
│   │   ├── __init__.py
│   │   ├── config.py             # Environment variables, settings
│   │   ├── database.py           # Database connection, session management
│   │   ├── security.py           # JWT, password hashing, authentication
│   │   ├── exceptions.py         # Custom exception classes
│   │   └── logging.py            # Logging configuration
│   ├── api/                      # API layer (controllers/routers)
│   │   ├── __init__.py
│   │   ├── dependencies.py       # Shared dependencies (auth, db, etc.)
│   │   └── v1/                   # API version 1
│   │       ├── __init__.py
│   │       ├── router.py         # Main API router
│   │       └── endpoints/        # Route handlers by domain
│   │           ├── __init__.py
│   │           ├── auth.py       # Authentication endpoints
│   │           ├── users.py      # User management endpoints
│   │           ├── restaurants.py # Restaurant management endpoints
│   │           ├── loyalty.py    # Loyalty program endpoints
│   │           ├── qr_codes.py   # QR code generation/scanning endpoints
│   │           └── analytics.py  # Analytics and reporting endpoints
│   ├── services/                 # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py       # Authentication business logic
│   │   ├── user_service.py       # User management business logic
│   │   ├── restaurant_service.py # Restaurant business logic
│   │   ├── loyalty_service.py    # Loyalty program business logic
│   │   ├── qr_service.py         # QR code business logic
│   │   ├── sms_service.py        # SMS sending service
│   │   ├── analytics_service.py  # Analytics business logic
│   │   └── notification_service.py # Push notification service
│   ├── repositories/             # Data access layer
│   │   ├── __init__.py
│   │   ├── base_repository.py    # Base repository with common CRUD operations
│   │   ├── user_repository.py    # User data access
│   │   ├── restaurant_repository.py # Restaurant data access
│   │   ├── loyalty_repository.py # Loyalty program data access
│   │   ├── qr_repository.py      # QR code data access
│   │   └── analytics_repository.py # Analytics data access
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py              # Base model with common fields
│   │   ├── user.py              # User model
│   │   ├── business_owner.py    # Business owner model
│   │   ├── establishment.py     # Restaurant/establishment model
│   │   ├── loyalty_program.py   # Loyalty program model
│   │   ├── user_loyalty_points.py # User loyalty points model
│   │   ├── qr_code.py           # QR code model
│   │   └── point_activity.py    # Point activity/transaction model
│   ├── schemas/                  # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── base.py              # Base schemas with common fields
│   │   ├── auth.py              # Authentication request/response schemas
│   │   ├── user.py              # User request/response schemas
│   │   ├── restaurant.py        # Restaurant request/response schemas
│   │   ├── loyalty.py           # Loyalty program request/response schemas
│   │   ├── qr_code.py           # QR code request/response schemas
│   │   └── analytics.py         # Analytics request/response schemas
│   ├── utils/                    # Helper functions and utilities
│   │   ├── __init__.py
│   │   ├── validators.py        # Custom validation functions
│   │   ├── formatters.py        # Data formatting utilities
│   │   ├── generators.py        # ID, code generation utilities
│   │   ├── constants.py         # Application constants
│   │   └── helpers.py           # General helper functions
│   └── migrations/               # Database migrations (Alembic)
│       ├── env.py
│       ├── script.py.mako
│       └── versions/
├── scripts/                      # Database and deployment scripts
│   ├── db_init.py               # Database initialization
│   ├── seed_data.py             # Sample data seeding
│   └── deploy.py                # Deployment scripts
├── requirements.txt              # Python dependencies
├── alembic.ini                  # Alembic configuration
└── application.py               # Application factory/startup
```

---

### **🔧 BACKEND FILE ORGANIZATION RULES**

### **1. API Layer (Controllers/Routers)**

- **All route handlers** → `app/api/v1/endpoints/`
- **Domain-based separation**: `auth.py`, `users.py`, `restaurants.py`, `loyalty.py`, `qr_codes.py`
- **Use FastAPI APIRouter** for each domain
- **HTTP methods**: GET, POST, PUT, DELETE, PATCH following REST conventions
- **File naming**: `snake_case.py`

### **2. Business Logic (Services)**

- **All business logic** → `app/services/`
- **One service per domain**: `user_service.py`, `loyalty_service.py`, etc.
- **Service methods**: `async def` for all operations
- **No direct database access** - use repositories
- **Error handling**: Raise custom exceptions from `core/exceptions.py`

### **3. Data Access (Repositories)**

- **All database operations** → `app/repositories/`
- **Inherit from BaseRepository** for common CRUD operations
- **Domain-specific queries**: Complex queries in respective repositories
- **Async methods only**: `async def` for all database operations
- **Type hints**: Proper return type annotations

### **4. Database Models (SQLAlchemy)**

- **All ORM models** → `app/models/`
- **Inherit from Base** model with common fields (id, created_at, updated_at)
- **Relationships**: Properly defined with foreign keys and back_populates
- **Table naming**: `snake_case` with domain prefix (e.g., `loyalty_programs`)
- **Column naming**: `snake_case` consistently

### **5. API Schemas (Pydantic)**

- **All request/response models** → `app/schemas/`
- **Separation by purpose**: `CreateUser`, `UpdateUser`, `UserResponse`
- **Inherit from BaseSchema** when applicable
- **Validation**: Use Pydantic validators for business rules
- **Naming convention**: `PascalCase` for schema classes

### **6. Core Configuration**

- **Application config** → `app/core/config.py`
- **Database setup** → `app/core/database.py`
- **Authentication logic** → `app/core/security.py`
- **Custom exceptions** → `app/core/exceptions.py`
- **Logging setup** → `app/core/logging.py`

### **7. Utilities**

- **Helper functions** → `app/utils/`
- **Constants** → `app/utils/constants.py`
- **Validators** → `app/utils/validators.py`
- **Generators** → `app/utils/generators.py` (QR codes, IDs, etc.)

---

### **🔧 BACKEND - FastAPI Python Best Practices:**

#### **🏗️ Architecture Patterns (MANDATORY)**

- **Domain-Driven Design**: Organize code by business domains (auth, loyalty, restaurants)
- **Dependency Injection**: Use FastAPI's dependency system for database sessions, auth, etc.
- **Repository Pattern**: All database operations through repository classes
- **Service Layer**: Business logic separated from API endpoints
- **Async/Await**: Use `async def` for all I/O operations (database, external APIs)

#### **🐍 Python Code Standards (MANDATORY)**

- **Type Hints**: ALL functions must have proper type annotations
- **Docstrings**: Use Google-style docstrings for all classes and functions
- **Error Handling**: Use custom exceptions, not generic Python exceptions
- **Import Order**:
  1. Standard library imports
  2. Third-party libraries (FastAPI, SQLAlchemy, etc.)
  3. Local application imports (from app.\*)
- **Naming Convention**:
  - Variables/functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Private methods: `_underscore_prefix`

#### **📊 Database Standards (MANDATORY)**

- **SQLAlchemy Models**:
  - Use `declarative_base()` inheritance
  - Include `id`, `created_at`, `updated_at` in base model
  - Define relationships with `back_populates`
  - Use proper foreign key constraints
- **Migrations**: All schema changes through Alembic migrations
- **Queries**: Use SQLAlchemy ORM, avoid raw SQL unless performance critical
- **Transactions**: Use database sessions properly with try/except/finally

#### **🔐 Security Standards (MANDATORY)**

- **Authentication**: JWT tokens with proper expiration
- **Password Hashing**: Use bcrypt or similar secure hashing
- **Input Validation**: Pydantic schemas for ALL request/response data
- **SQL Injection Prevention**: Use ORM parameterized queries
- **CORS**: Properly configured for frontend domains only

#### **✅ Correct Backend Code Examples:**

```python
# ✅ CORRECT - Service Layer with proper type hints and error handling
from typing import Optional, List
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse
from app.core.exceptions import UserNotFoundError, ValidationError

class UserService:
    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """
        Create a new user with phone number validation.

        Args:
            user_data: User creation data from request

        Returns:
            UserResponse: Created user data

        Raises:
            ValidationError: If phone number already exists
        """
        existing_user = await self._user_repository.get_by_phone(user_data.phone)
        if existing_user:
            raise ValidationError("Phone number already registered")

        user = await self._user_repository.create(user_data)
        return UserResponse.from_orm(user)
```

```python
# ✅ CORRECT - API Endpoint with proper dependencies and response models
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserResponse
from app.api.dependencies import get_user_service
from app.core.exceptions import ValidationError

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
) -> UserResponse:
    """Create a new user account."""
    try:
        return await user_service.create_user(user_data)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

```python
# ✅ CORRECT - Repository with proper async/await and type hints
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number."""
        result = await self._session.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()

    async def get_active_users(self) -> List[User]:
        """Get all active users."""
        result = await self._session.execute(
            select(User).where(User.is_active == True)
        )
        return result.scalars().all()
```

#### **❌ Avoid These Backend Patterns:**

```python
# ❌ WRONG - No type hints, poor error handling
def create_user(data):
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return user

# ❌ WRONG - Business logic in API endpoint
@router.post("/users/")
async def create_user(user_data: dict):
    if User.query.filter_by(phone=user_data["phone"]).first():
        return {"error": "Phone exists"}
    user = User(**user_data)
    db.session.add(user)
    db.session.commit()
    return user

# ❌ WRONG - Raw SQL without proper escaping
async def get_user_by_id(user_id: str):
    result = await db.execute(f"SELECT * FROM users WHERE id = {user_id}")
    return result.fetchone()

# ❌ WRONG - Sync functions instead of async
def get_all_users():
    return db.query(User).all()
```

#### **📁 Backend File Naming & Import Standards:**

```python
# ✅ CORRECT Import Pattern for Backend Files
# Standard library
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

# Third-party
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field, validator

# Local application
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
```

---

## 🔧 **When Creating/Moving Files:**

1. **Always check** if the target folder exists, create if needed
2. **Update all imports** in affected files
3. **Maintain the structure** - don't put files in wrong folders
4. **Ask before breaking changes** if unsure about file placement

## � **When Creating/Moving Backend Files:**

1. **Follow domain separation** - keep related functionality together
2. **Update dependencies** - ensure proper dependency injection chains
3. **Database migrations** - create Alembic migration for any model changes
4. **Update imports** - maintain proper import paths across all layers
5. **Error handling** - ensure exceptions bubble up correctly through layers

## 🗄️ **Database Considerations:**

- **PostgreSQL** as primary database with proper indexing
- **Async SQLAlchemy** for all database operations
- **Connection pooling** managed by FastAPI/SQLAlchemy
- **Migration strategy** through Alembic for all schema changes
- **Soft deletes** for important business data (users, restaurants, loyalty points)
- **Database constraints** to ensure data integrity
- **Proper foreign key relationships** with cascade rules

### **Backend:**

- **Don't put business logic in API endpoints** - use service layer
- **Don't access database directly from endpoints** - use repositories
- **Don't use synchronous functions** for I/O operations - use async/await
- **Don't skip type hints** - all functions must be properly typed
- **Don't use raw SQL** unless absolutely necessary for performance
- **Don't handle errors generically** - use specific custom exceptions
- **Don't bypass Pydantic validation** - use schemas for all API data
- **Don't commit database transactions manually** - let FastAPI handle it
- **Don't store sensitive data in logs** - sanitize all logging output
- **Don't create models without migrations** - always use Alembic
- **Don't mix sync and async code** - maintain consistency throughout
- **Don't hardcode configuration values** - use environment variables

---

### **Backend Response Patterns:**

- **Success Responses**: Use proper HTTP status codes (200, 201, 204)
- **Error Responses**: Consistent JSON structure with `{"detail": "message", "code": "ERROR_CODE"}`
- **Pagination**: Standard limit/offset pattern with total count
- **API Versioning**: All endpoints under `/api/v1/` prefix
- **Documentation**: Auto-generated OpenAPI/Swagger docs

#### **Backend:**

- **FastAPI ecosystem** first - check if FastAPI has built-in solution
- **Async-compatible** libraries only for I/O operations
- **Type-safe** libraries with proper typing support
- **Well-maintained** packages with active development
- **Security-audited** for authentication/crypto libraries

---

## 🏗️ **Architecture Principles:**

### **Full-Stack Consistency:**

- **Error Handling**: Frontend displays user-friendly messages from backend error codes
- **Data Models**: Pydantic schemas match TypeScript interfaces
- **Authentication**: JWT tokens work seamlessly between frontend/backend
- **API Contracts**: OpenAPI spec serves as single source of truth

### **Performance Standards:**

- **Database Queries**: Optimize with proper indexes and relationships
- **API Response Times**: Target <200ms for most endpoints
- **Mobile App**: Smooth 60fps animations and instant feedback
- **Caching**: Strategic caching for frequently accessed data

### **Security First:**

- **Input Validation**: All data validated at API boundary
- **Authentication**: Secure JWT implementation with refresh tokens
- **Authorization**: Role-based access control for restaurant owners
- **Data Privacy**: GDPR-compliant data handling practices

---

**Remember:** This is a professional QR Loyalty Platform serving real restaurants and customers. The code must be:

- **Production-ready** with proper error handling and logging
- **Scalable** to handle multiple restaurants and thousands of users
- **Maintainable** with clear separation of concerns
- **Secure** with industry-standard authentication and data protection
- **User-friendly** with intuitive interfaces for both customers and restaurant owners

Always prioritize:

- **Backend**: FastAPI with async/await, proper typing, and domain-driven architecture
- **Database**: PostgreSQL with proper relationships and migrations
- **API Design**: RESTful endpoints with clear documentation and error handling
