import math

from app.utils.expression_parser import ExpressionParser


class CalculatorService:
    def calculate_expression(self, expression):
        result = ExpressionParser().parse(expression)

        if isinstance(result, bool) or not isinstance(result, (int, float)):
            raise ValueError("Invalid expression")

        try:
            is_finite = math.isfinite(result)
        except OverflowError as error:
            raise ValueError("Invalid expression") from error

        if not is_finite:
            raise ValueError("Invalid expression")

        return float(result)

    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")

        return a / b

    def modulus(self, a, b):
        if b == 0:
            raise ValueError("Cannot perform modulus by zero")

        return a % b

    def power(self, a, b):
        return a ** b

    def square_root(self, value):
        if value < 0:
            raise ValueError(
                "Cannot calculate square root of a negative number"
            )

        return math.sqrt(value)

    def percentage(self, value):
        return value / 100