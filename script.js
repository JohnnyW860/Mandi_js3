
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
    title: "Problem z logowaniem",
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

// 5. RENDEROWANIE
function renderTickets() {
  // Czyścimy tylko widok, nigdy tablicę tickets.
  ticketList.replaceChildren();

  const filter = filterSelect.value;

  const visibleTickets = tickets.filter(ticket => {
    return filter === "all" || ticket.status === filter;
  });

  visibleTickets.forEach(ticket => {
    const li = document.createElement("li");
    li.className = `ticket priority-${ticket.priority}`;

    const heading = document.createElement("h3");
    heading.textContent = ticket.title;

    const details = document.createElement("p");
    details.textContent =
      `ID: ${ticket.id} | Status: ${statusLabel(ticket.status)} | ` +
      `Priorytet: ${priorityLabel(ticket.priority)}`;

    const actions = document.createElement("div");
    actions.className = "ticket-actions";

    const statusSelect = document.createElement("select");
    statusSelect.setAttribute(
      "aria-label",
      `Zmień status zgłoszenia ${ticket.id}`
    );

    STATUSES.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = statusLabel(status);
      option.selected = status === ticket.status;
      statusSelect.append(option);
    });

    statusSelect.addEventListener("change", () => {
      const result = changeStatus(ticket.id, statusSelect.value);

      if (result.ok) {
        showMessage(`Zmieniono status zgłoszenia ${ticket.id}.`);
        renderTickets();
      } else {
        showMessage(result.error, true);
      }
    });

    const idButton = document.createElement("button");
    idButton.type = "button";
    idButton.textContent = "Kopiuj ID";
    idButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(ticket.id);
        showMessage(`Skopiowano ID: ${ticket.id}`);
      } catch {
        showMessage(`ID zgłoszenia: ${ticket.id}`);
      }
    });

    actions.append(statusSelect, idButton);
    li.append(heading, details, actions);
    ticketList.append(li);
  });

  counter.textContent =
    `Widoczne: ${visibleTickets.length} / Wszystkie: ${tickets.length}`;

  emptyMessage.hidden = visibleTickets.length !== 0;
}

// 6. FORMULARZ
form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value;
  const priority = prioritySelect.value;

  const result = addTicket(title, priority);

  if (!result.ok) {
    showMessage(result.error, true);
    return;
  }

  // Czyścimy pole tylko po udanym dodaniu.
  form.reset();
  prioritySelect.value = "normal";

  showMessage(`Dodano zgłoszenie: ${result.ticket.id}`);
  renderTickets();
  titleInput.focus();
});

// 7. FILTR — ZMIENIA WYŁĄCZNIE WIDOK
filterSelect.addEventListener("change", renderTickets);

// 8. START
renderTickets();
