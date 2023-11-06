import axios from 'axios';
import { Calculator } from './src/calculator';

axios.defaults.headers.common = {
  'Content-Type': 'text/xml',
};

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
