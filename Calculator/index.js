const BASE_URL = 'https://calculator-api-2m8f.onrender.com/api/v1/calculator';

class Calculator {
  constructor(previousOperandTxt, currentOperandTxt) {
    this.previousOperandTxt = previousOperandTxt;
    this.currentOperandTxt = currentOperandTxt;
    this.clear();
  }

  clear() {
    this.previousOperand = '';
    this.currentOperand = '';
    this.operation = undefined;
  }

  delete() {
    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.currentOperand = this.previousOperand;
      this.previousOperand = '';
      this.operation = undefined;
      return;
    }
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNum(num) {
    if (!(num === '.' && this.currentOperand.includes('.'))) {
      this.currentOperand = `${this.currentOperand}${num}`;
    }
  }

  negative() {
    if (this.currentOperand === '' && this.operation != '√') {
      return (this.currentOperand = '-');
    }
  }

  async chooseOperation(operation) {
    if (operation === '-') {
      this.negative();
    }
    if (this.currentOperand === '-') {
      return;
    }
    if (this.previousOperand !== '') {
      await this.compute();
    }
    if (this.currentOperand !== '') {
      this.operation = operation;
      this.previousOperand = this.currentOperand;
      this.currentOperand = '';
    }
  }

  async compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    this.checkError(current, prev);

    if (!(isNaN(prev) || isNaN(current))) {
      switch (this.operation) {
        case '+':
          computation = await this.fetchResult('/add', { num1: prev, num2: current });
          break;
        case '-':
          computation = await this.fetchResult('/subtract', { num1: prev, num2: current });
          break;
        case '*':
          computation = await this.fetchResult('/multiply', { num1: prev, num2: current });
          break;
        case '÷':
          computation = await this.fetchResult('/divide', { num1: prev, num2: current });
          break;
        case '^':
          computation = await this.fetchResult('/power', { num: prev, power: current });
          break;
        default:
          return;
      }
    }

    // for some reason switch does not work with '√' so I wrote an extra "if"
    if (this.operation === '√') {
      computation = await this.fetchResult('/sqr-root', { num: prev });
    }

    this.currentOperand = this.resultLengthCheck(computation.toString());
    this.operation = undefined;
    this.previousOperand = '';
  }

  fetchResult(operation, query) {
    return axios.post(`${BASE_URL}/${operation}`, query).then(({ data }) => data.result);
  }

  checkError(current, prev) {
    // In Case someone tries to divide by 0
    if (current === 0 && this.operation === '÷') {
      this.currentOperand = "Can't divide by 0";
      this.operation = undefined;
      this.previousOperand = '';

      this.updateDisplay();

      this.currentOperand = '';
      this.operation = undefined;
      this.previousOperand = '';
      throw new Error('Error, division by 0!');
    }

    // In Case someone tries to take the square root of a negative number
    if (prev < 0 && this.operation === '√') {
      this.currentOperand = 'Undefined result';
      this.operation = undefined;
      this.previousOperand = '';

      this.updateDisplay();

      this.currentOperand = '';
      this.operation = undefined;
      this.previousOperand = '';
      throw new Error('Error, Sqrt from a negative number!');
    }
  }

  resultLengthCheck(str) {
    str = this.convertToLong(str);

    // count how many digits there are in the result
    const obj = str.match(/[0-9]/g);
    let size = 0;
    let k;
    for (k in obj) {
      if (obj.hasOwnProperty(k)) size++;
    }

    return this.round(str, size);
  }

  convertToLong(str) {
    // convert from compact
    const l = str.length;
    const e = str.indexOf('e', 0);

    if (e !== -1) {
      const power = parseFloat(str.slice(e + 1));

      str = str.slice(0, e);
      if (power >= 10) {
        str = (parseFloat(str) * 10 ** 10).toString();
      } else if (power <= -10) {
        str = (parseFloat(str) * 10 ** -10).toString();
      } else {
        str = (parseFloat(str) * 10 ** power).toString();
      }
    }

    return str;
  }

  round(str, size) {
    // Round down to 10 digits if necessary
    const commaIndex = str.indexOf('.', 0);
    const l = str.length;
    let rounded = parseFloat(str);

    if (size <= 10) {
      return rounded.toString();
    } else if (commaIndex === -1) {
      rounded = Math.round(rounded * 10 ** (10 - l));
      return rounded.toString();
    } else if (commaIndex === 10) {
      return Math.round(rounded).toString();
    } else if (commaIndex < 10) {
      rounded = Math.round(rounded * 10 ** (10 - commaIndex));
      rounded /= 10 ** (10 - commaIndex);
      return rounded.toString();
    } else {
      rounded = Math.round(rounded * 10 ** (10 - commaIndex));
      return rounded.toString();
    }
  }

  updateDisplay() {
    this.currentOperandTxt.innerHTML = this.currentOperand;

    if (this.operation != null) {
      this.previousOperandTxt.innerHTML = `${this.previousOperand} ${this.operation}`;
    } else if (this.previousOperand === '') {
      this.previousOperandTxt.innerHTML = this.previousOperand;
    }
  }
}

// Assign all the buttons and input output
const previousOperandTxt = document.querySelector('[data-previous-operand]');
const currentOperandTxt = document.querySelector('[data-current-operand]');
const clearBtn = document.querySelector('[data-clear]');
const deleteBtn = document.querySelector('[data-delete]');
const operationBtn = document.querySelectorAll('[data-operation]');
const numberBtn = document.querySelectorAll('[data-number]');
const equalsBtn = document.querySelector('[data-equals]');
const minusBtn = document.querySelector('[data-minus]');

const calculator = new Calculator(previousOperandTxt, currentOperandTxt);

numberBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    calculator.appendNum(btn.innerHTML);
    calculator.updateDisplay();
  });
});

operationBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    calculator.chooseOperation(btn.innerHTML);
    calculator.updateDisplay();
  });
});

clearBtn.addEventListener('click', () => {
  calculator.clear();
  calculator.updateDisplay();
});

equalsBtn.addEventListener('click', async () => {
  await calculator.compute();
  calculator.updateDisplay();
});

deleteBtn.addEventListener('click', () => {
  calculator.delete();
  calculator.updateDisplay();
});
