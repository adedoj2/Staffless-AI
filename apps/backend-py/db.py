import os
import asyncpg
from typing import Any

DATABASE_URL = os.environ.get("DATABASE_URL")

pool: asyncpg.pool.Pool | None = None

async def init_db():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)

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
