"""
'poly' 웹앱에서 정의한 '커스텀 다항식 언어' 규칙:

- '변수명' 또는 '문자 상수명'은 '영문 대소문자 1자'로 가정한다.
    ex.) a, x, y, z, A, B, C, ...

- 거듭제곱 기호는 '^'를 명시적으로 사용한다.
    ex.) a^2

- 곱셈 기호는 명시적으로 '*'를 지정해도 되고 생략해도 된다.
    ex.) 2a == 2*a, 10ab == 10*ab == 10*a*b

- 음수 표현은 '-' 기호를 사용하며, 항의 앞에 위치한다.
    ex.) -2x^2, -8a^2b

- 덧셈과 뺄셈은 '+', '-' 기호를 사용하여 표현한다.
    ex.) x^2 + 6x + 9, a^2 - 3a
"""

# 여기서부터 기존 코드 시작
import sys
import re
from sympy import expand, parse_expr, Poly
import time


# 수식 전처리
def preprocess_expression(expr):
    # poly에 사용하는 거듭제곱 기호 '^' 를 Python에서 사용하는 '**' 로 변경
    expr = expr.replace("^", "**")

    # 숫자와 변수 사이에 곱셈 기호 추가 (예: 2a -> 2*a, 10ab -> 10*ab)
    expr = re.sub(r"(\d+)([a-zA-Z])", r"\1*\2", expr)

    # 변수 사이에 곱셈 기호 추가 (예: ab -> a*b)
    expr = re.sub(r"(?<=\w)(?=[a-zA-Z])", "*", expr)

    # 괄호 앞뒤에 곱셈 기호 추가
    expr = re.sub(r"(\w)(\()", r"\1*\2", expr)
    expr = re.sub(r"(\))(\w)", r"\1*\2", expr)

    # 괄호와 괄호 사이에 곱셈 기호 추가 (예: (a+b)(x-y) -> (a+b)*(x-y), (a+b)  (x-y) -> (a+b)*(x-y))
    expr = re.sub(r"(\))\s*(\()", r"\1*\2", expr)

    return expr


def parse_expression(expr):
    try:
        return parse_expr(preprocess_expression(expr), evaluate=False)
    except Exception as e:
        print(f"Parsing error: {e}")
        return None


def verify_factorization(left, right):
    try:
        left_expr = parse_expression(left)
        right_expr = parse_expression(right)

        if left_expr is None:
            return False, f"Left expression parsing error: '{left}'"
        if right_expr is None:
            return False, f"Right expression parsing error: '{right}'"

        # 전개
        expanded_left = expand(left_expr)
        expanded_right = expand(right_expr)

        # 모든 변수 추출
        variables = expanded_left.free_symbols.union(expanded_right.free_symbols)
        variables = sorted(variables, key=lambda x: x.name)

        # Poly 객체로 변환
        poly_left = Poly(expanded_left, *variables)
        poly_right = Poly(expanded_right, *variables)

        # 계수 비교
        if poly_left.coeffs() != poly_right.coeffs():
            return (
                False,
                f"Coefficient mismatch: left {poly_left.coeffs()}, right {poly_right.coeffs()}",
            )

        return True, "OK"
    except Exception as e:
        return False, f"Exception occurred: {str(e)}"


def process_file(file_path):
    errors = []
    total_time = 0
    with open(file_path, "r", encoding="utf-8") as file:
        for line_number, line in enumerate(file, 1):
            start_time = time.time()
            line = line.strip()
            if "#" not in line:
                continue

            left, right = map(str.strip, line.split("#"))
            is_correct, message = verify_factorization(left, right)
            end_time = time.time()
            elapsed_time = (end_time - start_time) * 1000  # Convert to milliseconds

            if is_correct:
                print(f"Line {line_number}: {line} ... {elapsed_time:.2f}ms, OK")
            else:
                error_msg = f"Line {line_number}: {line} ... {elapsed_time:.2f}ms, Error: {message}"
                print(error_msg)
                errors.append(error_msg)

            total_time += elapsed_time / 1000  # Convert back to seconds for total time

    return errors, total_time


def main():
    if len(sys.argv) != 2:
        print("Usage: python verify_refactoring_data.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1].strip()
    start_time = time.time()
    errors, processing_time = process_file(file_path)
    end_time = time.time()
    total_time = end_time - start_time

    if errors:
        print("\nErrors found:")
        for error in errors:
            print(error)
        print(
            f"\nTotal processing time: {total_time:.4f}s (Pure processing time: {processing_time:.4f}s)"
        )
        sys.exit(1)
    else:
        print(f"\nAll lines verified successfully.")
        print(
            f"Total processing time: {total_time:.4f}s (Pure processing time: {processing_time:.4f}s)"
        )
        sys.exit(0)


if __name__ == "__main__":
    main()
