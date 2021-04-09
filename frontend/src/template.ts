const printValue = `#include <stdio.h>

int main() {
  int a = 429;
  float b = 3.141592;
  char c = 'A';
  char d[] = "Hello, World!";

  printf("%d\\n", a);
  printf("%04d\\n", a);
  printf("%f\\n", b);
  printf("%3.2f\\n", b);
  printf("%c\\n", c);
  printf("%s\\n", d);
  return 0;
}`;

const define = `#include <stdio.h>
#define foo 123
#define bar 456

int main() {
  printf("%d + %d = %d\\n", foo, bar, foo + bar);
  return 0;
}`;

const array = `#include <stdio.h>

int main() {
  int array[] = {0, 1, 2, 3};

  for(int i = 0; i < 4; i++) {
    printf("%d\\n", array[i]);
  }
  return 0;
}`;

const addressPtr = `#include <stdio.h>

int main() {
  int a = 1;
  int b = 2;

  printf("a = %d, b = %d\\n", a, b);
  printf("&a = %p, &b = %p\\n", &a, &b);
  return 0;
}`;

const functionTemplate = `#include <stdio.h>

int sum(int a, int b) {
  return a + b;
}

int main() {
  int a = 1;
  int b = 2;

  printf("%d + %d = %d\\n", a, b, sum(a, b));
  return 0;
}`;

const recursive = `#include <stdio.h>

int fact(int n) {
  if (n == 0) return 1;

  int m = fact(n - 1);
  return n * m;
}

int main() {
  for(int i = 0; i < 6; i++) {
    printf("%d! = ", i);
    for(int j = 1; j <= i; j++) {
      printf("%d %c ", j, j == i ? '=' : '*');
    }
    printf("%d\\n", fact(i));
  }

  return 0;
}`;

const scanf = `#include <stdio.h>

int main() {
  int a = 429;
  printf("%d\\n", a);
  scanf("%d", &a);
  printf("%d\\n", a);
  return 0;
}`;

export const templates = {
  "simple print value": printValue,
  "use define": define,
  array: array,
  "address and pointer": addressPtr,
  function: functionTemplate,
  recursive: recursive,
  scanf: scanf,
};
