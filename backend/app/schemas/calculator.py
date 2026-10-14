from pydantic import BaseModel, Field


class CalculationRequest(BaseModel):
    """
    Request received from the frontend.
    """

    expression: str = Field(
        ...,
        min_length=1,
        max_length=512,
        description="Mathematical expression to calculate",
    )


class CalculationResponse(BaseModel):
    """
    Response returned to the frontend.
    """

    expression: str
    result: float