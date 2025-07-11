// js/useContactModal.js
import { ref, computed } from 'https://cdn.jsdelivr.net/npm/vue@3.2.47/dist/vue.esm-browser.prod.js';

export function useContactModal() {
  const modalType = ref('');
  const modalData = ref(null);
  const submitStatus = ref('idle');

  const openModal = (type = 'contact', data = null) => {
    modalType.value = type;
    modalData.value = data;
  };

  const closeModal = () => {
    modalType.value = '';
    modalData.value = null;
    submitStatus.value = 'idle';
  };


  const submitForm = async () => {
    const form = document.querySelector('.modal_contact form');
    if (!form) {
      console.warn('找不到表單元素 contactForm');
      return;
    }
  
    const formData = new FormData(form);
    const data = {};
    formData.forEach((v, k) => (data[k] = v));
    data.timestamp = new Date().toLocaleString();
  
    submitStatus.value = 'sending';
  
    try {
      await fetch('https://script.google.com/macros/s/AKfycbwZl5Rh2A_fjTy7YrNYrKIOQ2wW1DnGOlsQ7IzHlqfuywnOIk8ClMYfT3CZx4QBFkQ/exec', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      });
  
      form.reset();
      submitStatus.value = 'success';
  
      setTimeout(() => closeModal(), 3000);
    } catch (err) {
      console.error('送出失敗', err);
      submitStatus.value = 'idle';
    }
  };

 

  return {
    modalType,
    modalData,
    submitStatus,
    openModal,
    closeModal,
    submitForm
  };
}