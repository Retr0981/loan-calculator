/**
 * Loan Calculator - Modern, Accessible, Production-Ready
 * Features: Real-time validation, error handling, localStorage persistence
 */

class LoanCalculator {
  constructor() {
    this.elements = this.cacheElements();
    this.attachEventListeners();
    this.loadFromStorage();
  }

  cacheElements() {
    return {
      form: document.getElementById('loanForm'),
      inputs: {
        amount: document.getElementById('amount'),
        interest: document.getElementById('interest'),
        years: document.getElementById('years'),
      },
      results: {
        monthlyPayment: document.getElementById('monthly-payment'),
        totalPayment: document.getElementById('total-payment'),
        totalInterest: document.getElementById('total-interest'),
      },
      containers: {
        loading: document.getElementById('loading'),
        results: document.getElementById('results'),
      },
      resetBtn: document.getElementById('resetBtn'),
    };
  }

  attachEventListeners() {
    this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.elements.resetBtn?.addEventListener('click', () => this.reset());

    // Real-time validation
    Object.values(this.elements.inputs).forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });
  }

  validateField(field) {
    const value = parseFloat(field.value);
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = '';

    const validationRules = {
      amount: {
        min: 100,
        max: 99999999,
        message: 'Amount must be between $100 and $99,999,999',
      },
      interest: {
        min: 0.1,
        max: 99,
        message: 'Interest rate must be between 0.1% and 99%',
      },
      years: {
        min: 1,
        max: 50,
        message: 'Loan term must be 1-50 years',
      },
    };

    const rule = validationRules[fieldName];
    if (!value || value < rule.min || value > rule.max) {
      isValid = false;
      errorMessage = rule.message;
    }

    this.toggleFieldError(field, isValid, errorMessage);
    return isValid;
  }

  toggleFieldError(field, isValid, message) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    field.classList.toggle('is-invalid', !isValid);
    field.classList.toggle('is-valid', isValid);
    if (feedback) feedback.textContent = isValid ? '' : message;
  }

  validateForm() {
    return Object.values(this.elements.inputs).every(input => this.validateField(input));
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.validateForm()) return;

    this.showLoading();
    // Simulate API call for better UX
    setTimeout(() => this.calculate(), 500);
  }

  showLoading() {
    this.elements.containers.loading.style.display = 'block';
    this.elements.containers.results.style.display = 'none';
    this.clearError();
  }

  calculate() {
    try {
      const principal = parseFloat(this.elements.inputs.amount.value);
      const annualInterest = parseFloat(this.elements.inputs.interest.value);
      const years = parseInt(this.elements.inputs.years.value, 10);

      const monthlyInterest = annualInterest / 100 / 12;
      const totalPayments = years * 12;

      const x = Math.pow(1 + monthlyInterest, totalPayments);
      const monthlyPayment = (principal * x * monthlyInterest) / (x - 1);

      if (!isFinite(monthlyPayment)) {
        throw new Error('Invalid calculation result');
      }

      this.displayResults({
        monthly: monthlyPayment,
        total: monthlyPayment * totalPayments,
        interest: (monthlyPayment * totalPayments) - principal,
      });

    } catch (error) {
      this.showError('Please check your numbers and try again.');
      console.error('Calculation error:', error);
    } finally {
      this.elements.containers.loading.style.display = 'none';
    }
  }

  displayResults({ monthly, total, interest }) {
    const formatCurrency = (num) => new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(num);

    this.elements.results.monthlyPayment.value = formatCurrency(monthly);
    this.elements.results.totalPayment.value = formatCurrency(total);
    this.elements.results.totalInterest.value = formatCurrency(interest);
    
    this.elements.containers.results.style.display = 'block';
    this.elements.containers.results.scrollIntoView({ behavior: 'smooth' });
  }

  showError(message) {
    this.clearError();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    
    this.elements.form.insertBefore(errorDiv, this.elements.form.firstChild);
    
    setTimeout(() => this.clearError(), 3000);
  }

  clearError() {
    document.querySelector('.alert-danger')?.remove();
  }

  reset() {
    this.elements.form.reset();
    this.elements.containers.results.style.display = 'none';
    Object.values(this.elements.inputs).forEach(input => {
      input.classList.remove('is-valid', 'is-invalid');
    });
    this.clearError();
  }

  // Save to localStorage
  saveToStorage() {
    const data = {
      amount: this.elements.inputs.amount.value,
      interest: this.elements.inputs.interest.value,
      years: this.elements.inputs.years.value,
    };
    localStorage.setItem('loanCalculator', JSON.stringify(data));
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('loanCalculator');
      if (saved) {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
          if (this.elements.inputs[key]) this.elements.inputs[key].value = value;
        });
      }
    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new LoanCalculator();
});
