import math


class CalculatorService:

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