from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.calculator_service import CalculatorService


router = APIRouter()
calculator_service = CalculatorService()


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

            expression = data.get("expression") if isinstance(data, dict) else None

            if not isinstance(expression, str) or not expression.strip():
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
                result = calculator_service.calculate_expression(expression)
                await websocket.send_json({
                    "event": "CALCULATION_COMPLETED",
                    "expression": expression,
                    "result": result,
                })
            except ValueError as error:
                await websocket.send_json({
                    "event": "CALCULATION_ERROR",
                    "message": (
                        "Cannot divide by zero"
                        if str(error) == "Cannot divide by zero"
                        else "Invalid expression"
                    ),
                })

    except WebSocketDisconnect:
        return