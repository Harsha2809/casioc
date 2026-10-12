import math
from fastapi import APIRouter, HTTPException

from app.schemas.calculator import (
    CalculationRequest,
    CalculationResponse,
)


router = APIRouter(
    prefix="/api",
    tags=["Calculator"],
)




def calculate_expression(expression: str) -> float:
    try:
        result = eval(
            expression,
            {
                "__builtins__": {},
                "sqrt": math.sqrt,
                "abs": abs,
                "factorial": math.factorial,
            },
            {},
        )

        if not isinstance(result, (int, float)):
            raise ValueError("Invalid result")

        if not math.isfinite(result):
            raise ValueError("Invalid result")

        return float(result)

    except ZeroDivisionError:
        raise HTTPException(
            status_code=400,
            detail="Cannot divide by zero",
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid expression",
        )


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

    result = calculate_expression(
        request.expression
    )

    return CalculationResponse(

        expression=request.expression,
        result=result,
    )