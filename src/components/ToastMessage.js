import { Toast } from 'bootstrap';

function createToast( title, subtitle, text ) {
  const toast = document.createElement("div");
  toast.classList.add("toast", "text-bg-dark");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  const toastHeader = document.createElement("div");
  toastHeader.classList.add("toast-header");

  const toastTitle = document.createElement("strong");
  toastTitle.classList.add("me-auto");
  toastTitle.innerText = title || "";
  toastHeader.appendChild(toastTitle);

  const toastSubtitle = document.createElement("small");
  toastSubtitle.innerText = subtitle || "";
  toastHeader.appendChild(toastSubtitle);

  const toastCloseButton = document.createElement("button");
  toastCloseButton.setAttribute("type", "button");
  toastCloseButton.classList.add("btn-close");
  toastCloseButton.setAttribute("data-bs-dismiss", "toast");
  toastCloseButton.setAttribute("aria-label", "Close");
  toastHeader.appendChild(toastCloseButton);

  toast.appendChild(toastHeader);
  
  const toastBody = document.createElement("div");
  toastBody.classList.add("toast-body");
  toastBody.innerText = text || "";
  toast.appendChild(toastBody);

  return toast;
}

export default function ToastMessages() {
  return <div id="toast-container" className="toast-container position-fixed bottom-0 end-0 p-3"></div>;
}

export function showToast(message) {
  const toast = createToast(message.title, message.subtitle, message.text);
  const toastContainer = document.getElementById("toast-container");
  // add toast to the position 0 of the toastContainer.
  toastContainer.insertBefore(toast, toastContainer.childNodes[0]);

  const toastBootstrap = Toast.getOrCreateInstance(toast);
  toastBootstrap.show();

  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}