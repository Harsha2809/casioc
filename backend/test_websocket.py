import asyncio
import json

import websockets


async def test_websocket():
    uri = "ws://127.0.0.1:8000/ws"

    async with websockets.connect(uri) as websocket:

        await websocket.send(
            json.dumps({
                "expression": "25 * 4 + 10"
            })
        )

        for _ in range(2):
            response = await websocket.recv()
            print(response)


if __name__ == "__main__":
    asyncio.run(test_websocket())
    