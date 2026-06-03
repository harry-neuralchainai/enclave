# Enclave local-dev seed (not part of upstream Onyx).
# Registers the in-stack Ollama service as Onyx's LLM provider and makes it the
# default. Run INSIDE the api_server container (it imports Onyx internals):
#
#   docker cp enclave_seed_ollama.py onyx-api_server-1:/tmp/enclave_seed_ollama.py
#   docker exec onyx-api_server-1 python /tmp/enclave_seed_ollama.py
#
# We seed via the DB layer because Onyx's admin HTTP API requires
# FULL_ADMIN_PANEL_ACCESS, which the anonymous user (AUTH_TYPE=disabled ->
# basic, no real users) does not have. Provider config persists in Postgres
# (db_volume), so this only needs re-running if that volume is wiped.
import os

from shared_configs.configs import POSTGRES_DEFAULT_SCHEMA
from shared_configs.contextvars import CURRENT_TENANT_ID_CONTEXTVAR
from onyx.db.engine.sql_engine import SqlEngine, get_session_with_current_tenant
from onyx.db.llm import (
    fetch_existing_llm_provider_by_name_and_type,
    update_default_provider,
    upsert_llm_provider,
)
from onyx.server.manage.llm.models import (
    LLMProviderUpsertRequest,
    ModelConfigurationUpsertRequest,
)

PROVIDER_NAME = "Ollama (local)"
PROVIDER_TYPE = "ollama_chat"

# Comma-separated list of models to register as visible. The default (used by
# Onyx when a request doesn't pin a model) is ENCLAVE_OLLAMA_DEFAULT_MODEL.
# 3b is the default: it gives usable answers to Onyx's agentic search prompt and
# fits a reasonably-resourced host. 1b is kept registered as a low-memory
# fallback (it fits a stock Docker Desktop but is too weak to answer well). For
# real use prefer llama3.1:8b on a GPU or native host — see the hardware guide in
# docker-compose.override.yml.
MODELS = [
    m.strip()
    for m in os.environ.get("ENCLAVE_OLLAMA_MODELS", "llama3.2:3b,llama3.2:1b").split(",")
    if m.strip()
]
DEFAULT_MODEL = os.environ.get("ENCLAVE_OLLAMA_DEFAULT_MODEL", "llama3.2:3b")
API_BASE = os.environ.get("ENCLAVE_OLLAMA_API_BASE", "http://ollama:11434")

SqlEngine.init_engine(pool_size=2, max_overflow=2)
CURRENT_TENANT_ID_CONTEXTVAR.set(POSTGRES_DEFAULT_SCHEMA)

with get_session_with_current_tenant() as db:
    # Idempotent: reuse the existing provider's id so re-runs update in place
    # instead of creating duplicate providers.
    existing = fetch_existing_llm_provider_by_name_and_type(
        name=PROVIDER_NAME, provider_type=PROVIDER_TYPE, db_session=db
    )
    req = LLMProviderUpsertRequest(
        id=existing.id if existing else None,
        name=PROVIDER_NAME,
        provider=PROVIDER_TYPE,
        api_base=API_BASE,
        api_key=None,
        custom_config=None,
        is_public=True,
        model_configurations=[
            ModelConfigurationUpsertRequest(
                name=model,
                is_visible=True,
                max_input_tokens=8192,
                supports_image_input=False,
            )
            for model in MODELS
        ],
    )
    result = upsert_llm_provider(llm_provider_upsert_request=req, db_session=db)
    db.commit()
    update_default_provider(
        provider_id=result.id, model_name=DEFAULT_MODEL, db_session=db
    )
    db.commit()
    print(
        f"OK seeded provider id={result.id} provider={result.provider} "
        f"api_base={result.api_base} models={MODELS} default_model={DEFAULT_MODEL}"
    )
