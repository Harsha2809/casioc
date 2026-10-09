import pytest

from app.services.calculator_service import CalculatorService
from app.utils.expression_parser import ExpressionParser


calculator = CalculatorService()
parser = ExpressionParser()


# -----------------------------
# Basic Calculator Tests
# -----------------------------

def test_addition():
    assert calculator.add(10, 5) == 15


def test_subtraction():
    assert calculator.subtract(10, 5) == 5


def test_multiplication():
    assert calculator.multiply(10, 5) == 50


def test_division():
    assert calculator.divide(10, 5) == 2


def test_modulus():
    assert calculator.modulus(10, 3) == 1


def test_power():
    assert calculator.power(2, 3) == 8


def test_square_root():
    assert calculator.square_root(25) == 5


def test_percentage():
    assert calculator.percentage(50) == 0.5


# -----------------------------
# Expression Tests
# -----------------------------

def test_simple_expression():
    assert parser.parse("10 + 5") == 15


def test_operator_precedence():
    assert parser.parse("10 + 5 * 2") == 20


def test_brackets():
    assert parser.parse("(10 + 5) * 2") == 30


def test_decimal_numbers():
    assert parser.parse("10.5 + 2.5") == 13


def test_negative_numbers():
    assert parser.parse("-10 + 5") == -5


def test_negative_multiplication():
    assert parser.parse("10 * -2") == -20


def test_power_expression():
    assert parser.parse("2 ** 3") == 8


def test_modulus_expression():
    assert parser.parse("10 % 3") == 1


# -----------------------------
# Error Tests
# -----------------------------

def test_divide_by_zero():

    with pytest.raises(ValueError):
        calculator.divide(10, 0)


def test_divide_by_zero_expression():

    with pytest.raises(ValueError):
        parser.parse("10 / 0")


def test_invalid_expression():

    with pytest.raises(ValueError):
        parser.parse("10 +")


def test_invalid_operator():

    with pytest.raises(ValueError):
        parser.parse("10 // 2")


def test_negative_square_root():

    with pytest.raises(ValueError):
        calculator.square_root(-25)