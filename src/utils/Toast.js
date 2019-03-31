import $ from 'jquery';

const ToastSingleton = (() => {
  class Toast {
    constructor() {
      this.timeout = 0;
    }

    getSpan(clazz, msg) {
      if (clazz === 'error') msg += ' (click to dismiss)';
      return `<span class="${clazz}">${msg}</span>`;
    }

    success = (msg) => {
      clearTimeout(this.timeout);
      $('#ic-toast').empty().append(this.getSpan('success', msg));
      this.timeout = setTimeout(this.clear, 5000);
    };

    info = (msg) => {
      clearTimeout(this.timeout);
      $('#ic-toast').empty().append(this.getSpan('info', msg));
      this.timeout = window.setTimeout(this.clear, 5000);
    };

    warn = (msg) => {
      clearTimeout(this.timeout);
      $('#ic-toast').empty().append(this.getSpan('warning', msg));
      this.timeout = setTimeout(this.clear, 5000);
    };

    error = (msg) => {
      clearTimeout(this.timeout);
      $('#ic-toast').empty().append(this.getSpan('error', msg));
    };

    clear() {
      $('#ic-toast').empty();
    }
  }

  let instance = null;

  return {
    getInstance: () => {
      if (!instance) {
        instance = new Toast();
        instance.constructor = null;
      }

      return instance;
    }
  };
})();

export default ToastSingleton;
