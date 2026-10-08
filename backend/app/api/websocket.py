from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    """
    Real-time calculator WebSocket.
    """

    await websocket.accept()

    try:
        while True:

            data = await websocket.receive_json()

            expression = data.get("expression")

            if not expression:
                await websocket.send_json({
                    "event": "CALCULATION_ERROR",
                    "message": "Expression is required",
                })

                continue

            # Notify frontend that calculation started
            await websocket.send_json({
                "event": "CALCULATION_STARTED",
                "expression": expression,
            })

            try:

                # Temporary calculation.
                # This will later call Member 1's
                # calculator service.

                result = eval(
                    expression,
                    {"__builtins__": {}},
                    {},
                )

                # Send calculation result
                await websocket.send_json({
                    "event": "CALCULATION_COMPLETED",
                    "expression": expression,
                    "result": result,
                })

            except ZeroDivisionError:

                await websocket.send_json({
                    "event": "CALCULATION_ERROR",
                    "message": "Cannot divide by zero",
                })

            except Exception:

                await websocket.send_json({
                    "event": "CALCULATION_ERROR",
                    "message": "Invalid expression",
                })

    except WebSocketDisconnect:

        print(
            "WebSocket client disconnected"
        )