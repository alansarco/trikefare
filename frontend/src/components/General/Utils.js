export const asofSelect = [
      { value: "today", desc: "Today" },
      { value: "week", desc: "Week" },
      { value: "month", desc: "Month" },
];

export const genderSelect = [
      { value: "M", desc: "Male" },
      { value: "F", desc: "Female" }
];

export const reportStatusSelect = [
      { value: 0, desc: "Pending" },
      { value: 1, desc: "Resolved" }
];

export const reportFromSelect = [
      { value: 0, desc: "Commuter" },
      { value: 1, desc: "Driver" }
];

export const statusSelect = [
      { value: 1, desc: "Active" },
      { value: 0, desc: "Inactive" },
];

export const accessLevelSelect = [
      { value: 10, desc: "Driver" },
      { value: 5, desc: "Commuter" },
];

export const reportSelectStatus = [
      { value: 1, desc: "Resolved" },
      { value: 0, desc: "Pending" },
];

export const accessSelect = [
      { value: 5, desc: "USER ACCESS" },
      { value: 999, desc: "ADMIN ACCESS" }
];

export const yesnoSelect = [
      { value: 1, desc: "Yes" },
      { value: 0, desc: "No" },
];

export const enableSelect = [
      { value: 1, desc: "Enabled" },
      { value: 0, desc: "Disabled" },
];

export const colorSelect = [
      { value: "success", desc: "Green" },
      { value: "primary", desc: "Red" },
      { value: "warning", desc: "Yellow" },
      { value: "info", desc: "Blue" },
      { value: "dark", desc: "Dark" },
];

export const prioritySelect = [
      { value: 1, desc: "Normal" },
      { value: 2, desc: "Important" },
      { value: 3, desc: "Urgent" },
];

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

export const currentDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

    
export function isEmpty(obj) {
      if (obj === null || obj === undefined) return true;
    
      if (Array.isArray(obj) || typeof obj === 'string') {
            return obj.length === 0;
      }
    
      if (typeof obj === 'object') {
            return Object.keys(obj).length === 0;
      }
    
      return false;
};

export function formatCurrency(amount) {
      if (isNaN(amount) || amount === '') return '0'; 
      if (amount.startsWith('0') && amount.length > 1 && !amount.includes('.')) {
          return amount.slice(1);
      }
      return amount;

}
    