import ast
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

        except (SyntaxError, ValueError, TypeError):
            raise ValueError("Invalid expression")

    def evaluate(self, node):
        """
        Recursively evaluate each part of the expression.
        """

        # Number
        if isinstance(node, ast.Constant):

            if isinstance(node.value, (int, float)):
                return node.value

            raise ValueError("Invalid number")

        # Binary operations
        if isinstance(node, ast.BinOp):

            left = self.evaluate(node.left)
            right = self.evaluate(node.right)

            operation = self.operators.get(type(node.op))

            if operation is None:
                raise ValueError("Operator not supported")

            return operation(left, right)

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