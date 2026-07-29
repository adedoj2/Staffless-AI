import os
import asyncpg
from typing import Any

pool: asyncpg.pool.Pool | None = None


async def init_db():
    """Create the connection pool.

    DATABASE_URL is read here (not at import time) so that .env values loaded
    by the app on startup are picked up. statement_cache_size=0 is required
    when connecting through the Supabase transaction pooler (port 6543), which
    does not support prepared statements.
    """
    global pool
    if pool is None:
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is not set")
        pool = await asyncpg.create_pool(
            database_url,
            min_size=1,
            max_size=10,
            statement_cache_size=0,
        )


async def close_db():
    global pool
    if pool:
        await pool.close()
        pool = None


async def fetchrow(query: str, *args) -> Any:
    async with pool.acquire() as conn:
        return await conn.fetchrow(query, *args)


async def fetch(query: str, *args) -> list[Any]:
    async with pool.acquire() as conn:
        return await conn.fetch(query, *args)


async def execute(query: str, *args) -> str:
    async with pool.acquire() as conn:
        return await conn.execute(query, *args)
