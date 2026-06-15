import redis.asyncio as aioredis
from app.core.config import settings

redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    max_connections=20,
)


async def get_cache(key: str):
    return await redis_client.get(key)


async def set_cache(key: str, value: str, expire: int = 300):
    await redis_client.setex(key, expire, value)


async def delete_cache(key: str):
    await redis_client.delete(key)


async def cache_prediction(village_hash: str, result: dict, expire: int = 3600):
    import json
    await set_cache(f"prediction:{village_hash}", json.dumps(result), expire)


async def get_cached_prediction(village_hash: str):
    import json
    cached = await get_cache(f"prediction:{village_hash}")
    return json.loads(cached) if cached else None
