"use strict";

const ROUTES = ["home", "about", "companies", "sectors", "education-legal", "investors", "contact"];
const PAGE_TITLES = {
  home: "Fakir Ventures | Web3 & AI Venture Studio",
  about: "About | Fakir Ventures",
  companies: "Child Companies | Fakir Ventures",
  sectors: "Sectors | Fakir Ventures",
  "education-legal": "Education Legal Documents | Fakir Ventures",
  investors: "Investors & Partners | Fakir Ventures",
  contact: "Contact | Fakir Ventures"
};

const BLUEPRINT = [
  {
    industry: "Agriculture",
    entries: [
      ["AgriTech Innovate", "Revolutionizing farming with AI-driven crop optimization and Web3 supply chains."],
      ["FarmLedger Nexus", "Tokenized procurement workflows for transparent farm contracts and settlement."],
      ["CropSense Dynamics", "Sensor and satellite intelligence for planting, irrigation, and yield planning."],
      ["GreenYield Robotics", "Autonomous field systems for precision seeding and low-waste crop care."],
      ["SoilPulse Analytics", "AI-powered soil diagnostics with blockchain-ready compliance reporting."]
    ]
  },
  {
    industry: "Education",
    entries: [
      ["EduAI Labs", "Personalized learning platforms powered by AI and blockchain for secure credentials."],
      ["LearnChain Academy", "Credential verification networks for schools, employers, and training programs."],
      ["MentorMesh", "AI mentor matching for students, professionals, and lifelong learners."],
      ["SkillForge XR", "Immersive training simulations for technical and industrial education."],
      ["CampusIQ Network", "Unified analytics for attendance, outcomes, and institutional planning."]
    ]
  },
  {
    industry: "Medical",
    entries: [
      ["MedChain Solutions", "Blockchain-enabled health records and AI diagnostics for better patient outcomes."],
      ["BioSignal AI", "Continuous patient monitoring intelligence for earlier clinical intervention."],
      ["CareLink Protocol", "Decentralized consent and secure data-sharing rails for healthcare systems."],
      ["ClinicFlow Systems", "Operational automation for clinics, diagnostics, and telehealth teams."],
      ["NeuroNova Health", "AI-assisted neurological screening with connected follow-up workflows."]
    ]
  },
  {
    industry: "Fashion & Clothing",
    entries: [
      ["FashionFusion", "Sustainable fashion design using AI algorithms and Web3 marketplaces."],
      ["ThreadVerse Labs", "Virtual garment prototyping and rapid design cycles for apparel teams."],
      ["WearSense Atelier", "Smart textile products with predictive inventory and customer insight loops."],
      ["EcoLoom Collective", "Circular manufacturing network for traceable low-waste sourcing."],
      ["RunwayChain Studio", "Blockchain authenticity systems for premium apparel and accessories."]
    ]
  },
  {
    industry: "Airlines",
    entries: [
      ["AeroNet Airlines", "Next-gen aviation with AI route optimization and decentralized booking systems."],
      ["SkyLedger Mobility", "Smart airline alliance workflows for settlement and loyalty portability."],
      ["FlightPulse AI", "Predictive fleet maintenance and reliability analytics for carriers."],
      ["OrbitRoute Systems", "Route optimization software to reduce fuel burn and delays."],
      ["CabinSync Aviation", "Cabin and crew operations orchestration for higher service performance."]
    ]
  },
  {
    industry: "Technology",
    entries: [
      ["QuantumStack Labs", "Enterprise AI deployment platform with secure model operations."],
      ["NodeSphere Systems", "Scalable node infrastructure for decentralized applications and services."],
      ["CipherCloud Core", "Zero-trust and confidential computing stack for sensitive workloads."],
      ["EdgePilot Robotics", "Edge intelligence for autonomous robotics and industrial systems."],
      ["AtlasCompute", "High-performance compute orchestration for AI and simulation."]
    ]
  },
  {
    industry: "Fintech",
    entries: [
      ["BlockBridge Capital", "Institutional tokenized asset workflows and governance tooling."],
      ["CrediChain One", "Programmable credit intelligence and lending automation."],
      ["PayFlux Network", "Cross-border payment rails with real-time risk controls."],
      ["VaultWave Digital", "Digital asset custody workflows for enterprise clients."],
      ["LedgerMint Services", "Real-time treasury analytics for modern finance teams."]
    ]
  },
  {
    industry: "Energy",
    entries: [
      ["HelioGrid Renewables", "Solar optimization with predictive generation and maintenance models."],
      ["VoltAI Storage", "Battery orchestration software for peak-demand balancing."],
      ["CarbonTrace Systems", "Auditable carbon accounting and offset tracking infrastructure."],
      ["GridChain Utilities", "Decentralized utility transactions and demand-response settlement."],
      ["FusionWind Dynamics", "Wind performance analytics and planning for output reliability."]
    ]
  },
  {
    industry: "Logistics",
    entries: [
      ["RouteMesh Logistics", "AI route orchestration for cost-efficient delivery networks."],
      ["FleetSight AI", "Fleet health, fuel, and utilization analytics for carriers."],
      ["PortChain Freight", "Blockchain-backed documentation and handoff visibility for freight."],
      ["CargoPulse Systems", "Predictive capacity planning and inventory flow intelligence."],
      ["LinkLoop Mobility", "Last-mile dispatch platform with real-time customer visibility."]
    ]
  },
  {
    industry: "Media",
    entries: [
      ["StoryByte Media", "AI-assisted content strategy and multichannel distribution intelligence."],
      ["SignalFrame Studios", "Data-driven creative production and campaign optimization."],
      ["StreamForge Network", "Decentralized streaming stack with flexible rights management."],
      ["VisionChain Content", "Provenance layer for authenticated digital media assets."],
      ["EchoSphere Communications", "Audience intelligence tools for narrative optimization."]
    ]
  }
];

const COMPANIES = BLUEPRINT.flatMap((group, groupIndex) =>
  group.entries.map(([name, description], itemIndex) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const size = 18 + groupIndex * 2 + itemIndex * 3;
    return {
      id: slug,
      name,
      industry: group.industry,
      logo: initials,
      description,
      fullDescription: `${name} operates in ${group.industry.toLowerCase()} with an AI and Web3 product stack designed for measurable operational gains and trusted digital infrastructure.`,
      team: `${size} specialists across product, engineering, and operations.`,
      contact: `${slug}@fakirventures.com`
    };
  })
);

const DOM = {
  sections: [...document.querySelectorAll(".page-section")],
  routeLinks: [...document.querySelectorAll("[data-route-link]")],
  nav: document.getElementById("site-nav"),
  menuToggle: document.getElementById("mobile-menu-toggle"),
  filterSelect: document.getElementById("sector-filter"),
  filterButtons: document.getElementById("sector-filter-buttons"),
  companiesSummary: document.getElementById("companies-summary"),
  companiesGrid: document.getElementById("companies-grid"),
  sectorButtons: [...document.querySelectorAll("[data-sector-target]")],
  form: document.getElementById("contact-form"),
  formStatus: document.getElementById("form-status"),
  year: document.getElementById("year")
};

const state = { route: "home", sector: "All" };
const SECTORS = ["All", ...new Set(COMPANIES.map((company) => company.industry))];
let revealObserver;

function parseHash() {
  const raw = window.location.hash.slice(1);
  if (!raw) return { route: "home", sector: null };
  const [routePart, query = ""] = raw.split("?");
  const route = ROUTES.includes(routePart) ? routePart : "home";
  const sector = new URLSearchParams(query).get("sector");
  return { route, sector };
}

function buildHash(route, sector = "All") {
  if (route !== "companies" || sector === "All") return `#${route}`;
  return `#companies?sector=${encodeURIComponent(sector)}`;
}

function normalizeSector(value) {
  if (!value) return "All";
  return SECTORS.find((sector) => sector.toLowerCase() === value.toLowerCase()) || "All";
}

function updateNav() {
  DOM.routeLinks.forEach((link) => link.classList.toggle("active", link.dataset.routeLink === state.route));
}

function updateDocumentTitle() {
  document.title = PAGE_TITLES[state.route] || PAGE_TITLES.home;
}

function setRoute(route, shouldScroll = true) {
  state.route = ROUTES.includes(route) ? route : "home";
  DOM.sections.forEach((section) => {
    const active = section.id === state.route;
    section.classList.toggle("active", active);
    section.setAttribute("aria-hidden", String(!active));
  });
  updateNav();
  updateDocumentTitle();
  if (state.route === "companies") renderCompanies();
  if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  observeReveals();
}

function closeMobileMenu() {
  DOM.nav.classList.remove("open");
  DOM.menuToggle.setAttribute("aria-expanded", "false");
}

function renderFilterControls() {
  DOM.filterSelect.innerHTML = "";
  DOM.filterButtons.innerHTML = "";
  SECTORS.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    DOM.filterSelect.appendChild(option);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.sector = sector;
    button.textContent = sector;
    DOM.filterButtons.appendChild(button);
  });
  syncFilterUI();
}

function syncFilterUI() {
  DOM.filterSelect.value = state.sector;
  [...DOM.filterButtons.children].forEach((button) => {
    const active = button.dataset.sector === state.sector;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function getFilteredCompanies() {
  return state.sector === "All"
    ? COMPANIES
    : COMPANIES.filter((company) => company.industry === state.sector);
}

function renderCompanies() {
  const visible = getFilteredCompanies();
  DOM.companiesGrid.innerHTML = "";

  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No companies found for this filter.";
    DOM.companiesGrid.appendChild(empty);
  } else {
    visible.forEach((company) => {
      const card = document.createElement("article");
      card.className = "company-card reveal";
      card.innerHTML = `
        <div class="company-head">
          <div class="company-logo" aria-hidden="true">${company.logo}</div>
          <div class="company-title-wrap">
            <h3>${company.name}</h3>
            <p class="company-industry">${company.industry}</p>
          </div>
        </div>
        <p>${company.description}</p>
        <p><strong>Team:</strong> ${company.team}</p>
        <p><strong>Contact:</strong> ${company.contact}</p>
      `;
      DOM.companiesGrid.appendChild(card);
    });
  }

  DOM.companiesSummary.textContent = `Showing ${visible.length} of ${COMPANIES.length} child companies${
    state.sector === "All" ? "." : ` in ${state.sector}.`
  }`;

  syncFilterUI();
  observeReveals();
}

function setSector(sector, updateHash = true) {
  state.sector = normalizeSector(sector);
  renderCompanies();
  if (updateHash && state.route === "companies") {
    history.replaceState(null, "", buildHash("companies", state.sector));
  }
}

function initRevealObserver() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  observeReveals();
}

function observeReveals() {
  const targets = document.querySelectorAll(".reveal:not(.visible)");
  if (!revealObserver) {
    targets.forEach((target) => target.classList.add("visible"));
    return;
  }
  targets.forEach((target) => revealObserver.observe(target));
}

function validateForm(name, email, message) {
  if (name.trim().length < 2) return "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
  if (message.trim().length < 12) return "Please enter a message with at least 12 characters.";
  return "";
}

function wireEvents() {
  window.addEventListener("hashchange", () => {
    const { route, sector } = parseHash();
    if (route === "companies") state.sector = normalizeSector(sector);
    setRoute(route);
  });

  DOM.menuToggle.addEventListener("click", () => {
    const isOpen = DOM.nav.classList.toggle("open");
    DOM.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  DOM.routeLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));

  DOM.filterSelect.addEventListener("change", (event) => setSector(event.target.value));
  DOM.filterButtons.addEventListener("click", (event) => {
    const chip = event.target.closest(".filter-chip");
    if (chip) setSector(chip.dataset.sector);
  });

  DOM.sectorButtons.forEach((button) =>
    button.addEventListener("click", () => {
      window.location.hash = buildHash("companies", button.dataset.sectorTarget);
    })
  );

  DOM.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(DOM.form);
    const error = validateForm(
      String(data.get("name") || ""),
      String(data.get("email") || ""),
      String(data.get("message") || "")
    );
    if (error) {
      DOM.formStatus.textContent = error;
      DOM.formStatus.className = "form-status error";
      return;
    }
    DOM.formStatus.textContent = "Message submitted successfully.";
    DOM.formStatus.className = "form-status success";
    alert("Thank you for your message! We will get back to you soon.");
    DOM.form.reset();
  });
}

function init() {
  renderFilterControls();
  initRevealObserver();
  wireEvents();
  DOM.year.textContent = String(new Date().getFullYear());
  const { route, sector } = parseHash();
  state.sector = normalizeSector(sector);
  setRoute(route, false);
}

init();
