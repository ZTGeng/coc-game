import { Toast } from 'bootstrap';

function createToast(title, subtitle, text, color) {
  const template = `
    <div class="toast text-bg-${color || "dark"}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">${title || ""}</strong>
        <small>${subtitle || ""}</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${text || ""}</div>
    </div>
  `;

  const templateElement = document.createElement("div");
  templateElement.innerHTML = template.trim();
  return templateElement.firstChild;
}

export default function ToastMessages() {
  return <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>;
}

export function showToast(message) { // { title, subtitle, text, color } 
  const toast = createToast(message.title, message.subtitle, message.text, message.color);
  const toastContainer = document.getElementById("toast-container");
  // add toast to the position 0 of the toastContainer.
  toastContainer.insertBefore(toast, toastContainer.childNodes[0]);

  const toastBootstrap = Toast.getOrCreateInstance(toast);
  toastBootstrap.show();

  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}