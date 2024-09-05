
## python03/app.py
import asyncio
import aioredis
import time

async def main():
    redis = await aioredis.create_redis('redis://keydb_03')
    res = await redis.get('shared_key')
    if res:
        # Extract the timestamp from shared_key and calculate the difference
        key_value = res.decode('utf-8')
        timestamp_str = key_value.split()[-1]
        written_time = int(timestamp_str)
        current_time = int(time.time())
        time_difference = current_time - written_time
        print(f"Python03 read shared_key: {key_value}, Time difference: {time_difference} seconds")

        # Perform handshake operation
        handshake_value = f"Handshake from Python03"
        await redis.set("handshake_key", handshake_value)
        print(f"Python03 set handshake_key: {handshake_value}")

    redis.close()
    await redis.wait_closed()

asyncio.run(main())