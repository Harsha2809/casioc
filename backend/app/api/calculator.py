from fastapi import APIRouter, HTTPException

from app.schemas.calculator import (
    CalculationRequest,
    CalculationResponse,
)
from app.services.calculator_service import CalculatorService


router = APIRouter(
    prefix="/api",
    tags=["Calculator"],
)

calculator_service = CalculatorService()


@router.post(
    "/calculate",
    response_model=CalculationResponse,
)
async def calculate(
    request: CalculationRequest,
):
    """
    Calculate a mathematical expression.
    """

    try:
        result = calculator_service.calculate_expression(request.expression)
    except ValueError as error:
        detail = (
            "Cannot divide by zero"
            if str(error) == "Cannot divide by zero"
            else "Invalid expression"
        )
        raise HTTPException(status_code=400, detail=detail) from error

    return CalculationResponse(
        expression=request.expression,
        result=result,
    )