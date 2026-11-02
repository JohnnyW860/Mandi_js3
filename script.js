
"use strict";

// 1. DANE
let tickets = [
  {
    id: "ticket-1",
    title: "Problem z logowaniem",
    status: "new",
    priority: "high"
  },
  {
    id: "ticket-2",
    title: "Problem z logowaniem 2",
    status: "doing",
    priority: "normal"
  }
];

const STATUSES = ["new", "doing", "done"];
const PRIORITIES = ["low", "normal", "high"];
const MAX_TICKETS = 1000;

// 2. SELEKTORY DOM
const form = document.querySelector("#ticket-form");
const titleInput = document.querySelector("#title");
const prioritySelect = document.querySelector("#priority");
const filterSelect = document.querySelector("#filter");
const ticketList = document.querySelector("#ticket-list");
const counter = document.querySelector("#counter");
const message = document.querySelector("#message");
const emptyMessage = document.querySelector("#empty-message");

// 3. REGUŁY BIZNESOWE — BEZ DOM

function addTicket(title, priority = "normal") {
  if (typeof title !== "string") {
    return { ok: false, error: "Tytuł musi być tekstem." };
  }

  const cleanTitle = title.trim();

  if (cleanTitle.length < 3 || cleanTitle.length > 80) {
    return {
      ok: false,
      error: "Tytuł musi mieć od 3 do 80 znaków."
    };
  }

  if (!PRIORITIES.includes(priority)) {
    return { ok: false, error: "Nieprawidłowy priorytet." };
  }

  if (tickets.length >= MAX_TICKETS) {
    return { ok: false, error: "Limit 1000 zgłoszeń został osiągnięty." };
  }

  const id = crypto.randomUUID();

  tickets.push({
    id,
    title: cleanTitle,
    status: "new",
    priority
  });

  return { ok: true, ticket: tickets[tickets.length - 1] };
}

function changeStatus(id, status) {
  if (typeof id !== "string" || id.length === 0 || id.length > 100) {
    return { ok: false, error: "Nieprawidłowe ID." };
  }

  if (!STATUSES.includes(status)) {
    return { ok: false, error: "Nieprawidłowy status." };
  }

  const ticket = tickets.find(item => item.id === id);

  if (!ticket) {
    return { ok: false, error: "Nie znaleziono zgłoszenia." };
  }

  ticket.status = status;

  return { ok: true, ticket };
}

// 4. ETYKIETY
function statusLabel(status) {
  const labels = {
    new: "Nowe",
    doing: "W trakcie",
    done: "Zakończone"
  };

  return labels[status];
}

function priorityLabel(priority) {
  const labels = {
    low: "Niski",
    normal: "Normalny",
    high: "Wysoki"
  };

  return labels[priority];
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

// 5. STATUS PO ID
// 6. FILTR I LICZNIK

// Tworzenie pojedynczego zgłoszenia
function createTicketRow(ticket) {

  const li = document.createElement("li");

  const title = document.createElement("strong");
  title.textContent = ticket.title;

  const details = document.createElement("p");
  details.textContent = `ID: ${ticket.id} | Priorytet: ${priorityLabel(ticket.priority)}`;

  const label = document.createElement("label");
  label.textContent = `ID: ${ticket.id} | Status zgłoszenia: `;

  const select = document.createElement("select");
  select.setAttribute("aria-label", `Status zgłoszenia ${ticket.id}`);

  STATUSES.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = statusLabel(status);
    select.append(option);
  });

  select.value = ticket.status;

  // Zmiana statusu konkretnego zgłoszenia po ID
  select.addEventListener("change", () => {

    const result = changeStatus(ticket.id, select.value);

    if (!result.ok) {
      showMessage(result.error, true);
      return;
    }

    render();

    filterSelect.focus();

    showMessage("Status zgłoszenia został zmieniony.");

  });

  li.append(title, details, label, select);

  return li;
}


// Wyświetlanie zgłoszeń
function render() {

  const selectedStatus = filterSelect.value;

  // Filtr tworzy tylko widok, nie usuwa danych
  const visible = tickets.filter(ticket => {
    return selectedStatus === "all" || ticket.status === selectedStatus;
  });

  ticketList.replaceChildren();

  visible.forEach(ticket => {
    const row = createTicketRow(ticket);
    ticketList.append(row);
  });

  // Licznik zgłoszeń
  counter.textContent = `Widoczne: ${visible.length} / Wszystkie: ${tickets.length}`;

  // Komunikat pustego wyniku
  emptyMessage.hidden = visible.length !== 0;
}


// Obsługa filtra
filterSelect.addEventListener("change", render);


// 7. KLAWIATURA I INTEGRACJA

form.addEventListener("submit", event => {

  event.preventDefault();

  const title = titleInput.value;
  const priority = prioritySelect.value;

  const result = addTicket(title, priority);

  if (!result.ok) {
    showMessage(result.error, true);
    titleInput.focus();
    return;
  }

  titleInput.value = "";

  showMessage(`Dodano zgłoszenie: ${result.ticket.title}`);

  render();

  titleInput.focus();

});


// Pierwsze wyświetlenie
render();