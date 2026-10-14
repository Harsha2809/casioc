import ast
import math
import operator


class ExpressionParser:

    # Supported operators
    operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Mod: operator.mod,
        ast.Pow: operator.pow,
        ast.BitXor: operator.pow,
    }
    functions = {
        "sqrt": math.sqrt,
        "abs": abs,
        "factorial": math.factorial,
    }

    def parse(self, expression):
        """
        Convert a string expression into a calculated result.
        """

        try:
            # Convert expression into an AST tree
            tree = ast.parse(expression, mode="eval")

            # Evaluate the tree
            return self.evaluate(tree.body)

        except ZeroDivisionError:
            raise ValueError("Cannot divide by zero")

        except (SyntaxError, ValueError, TypeError, OverflowError) as error:
            raise ValueError("Invalid expression") from error

    def evaluate(self, node):
        """
        Recursively evaluate each part of the expression.
        """

        # Number
        if isinstance(node, ast.Constant):

            if isinstance(node.value, (int, float)) and not isinstance(
                node.value, bool
            ):
                return node.value

            raise ValueError("Invalid number")

        # Supported single-argument mathematical functions.
        if isinstance(node, ast.Call):
            if (
                not isinstance(node.func, ast.Name)
                or node.func.id not in self.functions
                or len(node.args) != 1
                or node.keywords
            ):
                raise ValueError("Invalid function")

            argument = self.evaluate(node.args[0])
            if node.func.id == "factorial" and (
                not isinstance(argument, int)
                or isinstance(argument, bool)
                or argument < 0
                or argument > 170
            ):
                raise ValueError("Invalid factorial argument")

            return self.functions[node.func.id](argument)

        # Binary operations
        if isinstance(node, ast.BinOp):

            left = self.evaluate(node.left)
            right = self.evaluate(node.right)

            operation = self.operators.get(type(node.op))

            if operation is None:
                raise ValueError("Operator not supported")

            if isinstance(node.op, (ast.Pow, ast.BitXor)) and abs(right) > 1000:
                raise ValueError("Exponent is too large")

            result = operation(left, right)
            if isinstance(result, int) and result.bit_length() > 4096:
                raise ValueError("Result is too large")
            if isinstance(result, float) and not math.isfinite(result):
                raise ValueError("Invalid result")

            return result

        # Positive and negative numbers
        if isinstance(node, ast.UnaryOp):

            value = self.evaluate(node.operand)

            # Negative number
            if isinstance(node.op, ast.USub):
                return -value

            # Positive number
            if isinstance(node.op, ast.UAdd):
                return value

            raise ValueError("Invalid unary operator")

        raise ValueError("Invalid expression")