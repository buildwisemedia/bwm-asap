import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const phone = "770-691-3636";
const tel = "+17706913636";
const reviewUrl = "https://www.google.com/maps/place/ASAP+Wildlife+Removal/@33.734354,-84.242248,10z/data=!4m8!3m7!1s0x88f51d199bdde957:0x677a4db004e50c72!8m2!3d33.734354!4d-84.242248!9m1!1b1!16s%2Fg%2F11j3147h44?hl=en&entry=ttu";

const articles = {
  ratTunneling: ["Why rats tunnel — and what that can tell you", "Existing", "https://medium.com/@ASAPwildlife/understanding-the-reasons-behind-rat-tunneling-11c3bf8a4e03"],
  winterRodents: ["Why rodents move inside when it gets cold", "Existing", "https://medium.com/@ASAPwildlife/rodent-winter-roommates-why-rodents-move-in-when-its-cold-d51cb888c843"],
  rodentTraits: ["13 traits rats and squirrels share", "Existing", "https://medium.com/@ASAPwildlife/rats-sqrls-are-bffs-13-crazy-common-traits-ef190a50c3c6"],
  squirrelAttic: ["Why squirrels keep choosing attics", "Existing", "https://medium.com/@ASAPwildlife/why-squirrels-cant-resist-your-attic-you-won-t-believe-it-a4732378a520"],
  squirrelFacts: ["The #1 reason squirrels avoid people", "Existing", "https://medium.com/@info_43708/the-1-reason-squirrels-hate-you-e4f1c44f0edd"],
  squirrelBehavior: ["A lighter look at squirrel behavior", "Existing", "https://medium.com/@info_43708/squirrels-%EF%B8%8F-to-twerk-b53f3a95cab6"],
  raccoonHands: ["How raccoons use their hands", "Existing", "https://medium.com/@info_43708/raccoons-how-they-use-their-hands-d2efaa51319a"],
  batsVisit: ["Why bats visit — and when removal timing matters", "Existing", "https://medium.com/@ASAPwildlife/flying-guests-heres-why-bats-might-visit-and-when-you-can-t-evict-them-7acef4dda5f0"],
  batGuano: ["What bat guano can mean for an attic", "Existing", "https://medium.com/@info_43708/bat-poop-dangers-22d54b59d6be"]
};

const gap = (title) => [title, "Editorial gap", ""];

const animals = [
  {
    kind: "animal", slug: "peace-of-mind-from/rodents", key: "rodent",
    name: "Rodent Removal", title: "Rodent Removal in Metro ATL", outlined: "Rodent", second: "Removal",
    eyebrow: "Mice · Rats · Squirrels · Flying Squirrels · Chipmunks",
    description: "Rodent removal for Metro Atlanta homes, with inspection, control, entry-point repair, cleanup options, and a plan shaped to the animal and property.",
    logo: "/assets/images/page-logos/rodent.png", art: "/assets/images/animals/rat-navy-optimized.webp", artAlt: "ASAP illustrated rat mascot",
    warmth: "You deserve to feel at ease in your home again. We explain what we find and what comes next.",
    answerTitle: "What does a complete rodent plan include?",
    answer: "A useful rodent plan identifies the species, traces activity and access points, selects the right control method, and addresses openings that can allow the problem to return. Cleanup, monitoring, and warranty options depend on the inspection and written scope.",
    facts: [
      ["Umbrella intent", "This page helps visitors compare mice, rats, squirrels, flying squirrels, and chipmunks before choosing a specific service page."],
      ["Property-specific", "The right plan depends on the animal, the location of activity, the entry route, and the condition of the structure."],
      ["Recurring monitoring", "Exterior bait-station programs may be considered for ongoing mouse and rat pressure after inspection; they do not replace structural repair where repair is needed."]
    ],
    intentRoutes: [
      {
        label: "Specific rodent service",
        title: "Small droppings, gnawing, or movement in walls",
        description: "Mice and rats need a species-aware control, exclusion, cleanup, and monitoring plan.",
        href: "/wildlife/mouse-rat/",
        cta: "Open the Rat + Mouse page",
        target: "rat-mouse"
      },
      {
        label: "Separate squirrel service",
        title: "Daytime roofline or attic scratching",
        description: "Gray and flying squirrels have their own humane timing, removal, repair, and cleanup path.",
        href: "/wildlife/gray-squirrel/",
        cta: "Open the Squirrel page",
        target: "squirrel"
      },
      {
        label: "Not a rodent",
        title: "Heavy nighttime movement or visible roof damage",
        description: "Raccoons require a separate wildlife plan that accounts for adults, possible young, repair, and contamination.",
        href: "/wildlife/raccoon/",
        cta: "Open the Raccoon page",
        target: "raccoon"
      },
      {
        label: "Not a rodent",
        title: "Fluttering, chirping, or a bat indoors",
        description: "Bat work has a separate season-aware exclusion and guano-cleanup path under current Georgia guidance.",
        href: "/wildlife/bats/",
        cta: "Open the Bat page",
        target: "bat"
      }
    ],
    features: [
      ["Mice and rats", "Inspect activity, likely travel paths, food and water pressure, and openings that may be supporting repeat entry."],
      ["Tree squirrels", "Identify attic or roofline activity and plan humane removal with careful timing and repair."],
      ["Flying squirrels", "Look for upper-level access, group activity, latrine areas, and insulation disturbance."],
      ["Chipmunks", "Assess burrows and exterior conditions before recommending a control plan."],
      ["Entry-point repair", "Document vulnerable openings and present repair options that match the inspection findings."],
      ["Cleanup and monitoring", "Separate removal, sanitation, repair, and recurring monitoring so each recommendation stays clear."]
    ],
    faqs: [
      ["How do I know which rodent is in my home?", "Noises, droppings, tracks, nesting material, timing, and the location of damage can narrow the answer. An inspection should confirm the animal before the work is scoped."],
      ["Is trapping enough?", "Trapping can address animals that are present, but the inspection may also identify openings or conditions that need repair. The plan should explain control and exclusion as separate parts of the solution."],
      ["Do you offer recurring rodent bait stations?", "Recurring exterior bait-station service can be discussed for ongoing mouse and rat pressure. Placement, product choice, visit frequency, and safety controls require a property-specific service plan."],
      ["Does rodent activity create health concerns?", "Rodents can contaminate areas with droppings, urine, nesting material, and parasites. The level of risk and the right cleanup method depend on the affected area and should not be guessed from a webpage."],
      ["Should I sweep or vacuum droppings before the inspection?", "No. CDC guidance says not to sweep or vacuum dry rodent urine, droppings, or nests because that can put contaminated particles into the air. Avoid disturbing the area and follow current safe-cleanup guidance for the site conditions."]
    ],
    articles: [articles.winterRodents, articles.rodentTraits, gap("How to compare trapping, exclusion, and recurring monitoring")]
  },
  {
    kind: "animal", slug: "wildlife/mouse-rat", key: "rat-mouse",
    name: "Rat and Mouse Removal", title: "Rat and Mouse Removal in Metro ATL", outlined: "Rat + Mouse", second: "Removal",
    eyebrow: "Inspection · Control · Exclusion · Monitoring",
    description: "Rat and mouse removal in Metro Atlanta with species-aware inspection, a clear control plan, entry-point repair options, and recurring bait-station programs where appropriate.",
    logo: "/assets/images/page-logos/rat-mouse.png", art: "/assets/images/wildlife-grid/mouse-rat.png", artAlt: "ASAP illustrated mouse",
    warmth: "Hearing movement in a wall or attic can make a home feel unfamiliar. We help turn the noise into a clear plan.",
    answerTitle: "A plan should solve the source — not just today’s sighting",
    answer: "Mice, roof rats, and Norway rats behave differently. A good plan connects the evidence indoors with travel routes, food and water pressure, exterior activity, and the openings that may be allowing entry. That keeps control, repair, cleanup, and monitoring decisions understandable.",
    facts: [
      ["House mice", "Small openings and indoor nesting can support repeat activity. Inspection should connect signs to likely access and shelter."],
      ["Roof rats", "Upper-level travel, rooflines, trees, and attic spaces often matter. The exact cause must be inspected."],
      ["Norway rats", "Lower-level travel, burrows, drainage, and exterior pressure may matter. A site plan should follow the evidence."]
    ],
    features: [
      ["Recurring bait stations", "A documented exterior program can help monitor and control ongoing rat or mouse pressure where the inspection supports it."],
      ["Exclusion work", "Entry-point repair is scoped separately from trapping or baiting so the homeowner knows what is being sealed and why."],
      ["Cleanup options", "Contaminated materials and affected areas are evaluated before sanitation or removal is recommended."],
      ["Clear service records", "The plan should name station locations, visit cadence, findings, changes, and the next decision."],
      ["Family and pet context", "Product and station choices require label-compliant placement and a conversation about children, pets, and property use."],
      ["Property fit", "One-time control, repair, and recurring service are different tools. The inspection determines which tools belong in the plan."]
    ],
    faqs: [
      ["Is trapping enough to solve a rat or mouse problem?", "Trapping can reduce animals that are present, but it may not address openings or exterior pressure. A complete plan should explain whether exclusion work and monitoring are also needed."],
      ["Do mice and rats cause any diseases?", "Rodents can be associated with pathogens, allergens, and contamination from droppings, urine, nesting material, or parasites. Risk varies by species, exposure, and site conditions; an inspection should guide cleanup and any health follow-up."],
      ["How do recurring bait stations work?", "Tamper-resistant exterior stations are placed and serviced under a documented plan. The technician monitors activity and adjusts the program according to findings and product-label requirements."],
      ["Will you seal entry points?", "ASAP can inspect for vulnerable openings and scope repair options. The written proposal should identify the areas included, materials, limitations, and any warranty terms."]
    ],
    articles: [articles.ratTunneling, articles.winterRodents, articles.rodentTraits]
  },
  {
    kind: "animal", slug: "wildlife/gray-squirrel", key: "squirrel",
    name: "Squirrel Removal", title: "Squirrel Removal in Metro ATL", outlined: "Squirrel", second: "Removal",
    eyebrow: "Gray and Flying Squirrel Control",
    description: "Humane gray and flying squirrel removal in Metro Atlanta, with attic inspection, route identification, repair planning, cleanup options, and clear next steps.",
    logo: "/assets/images/page-logos/squirrel.png", art: "/assets/images/wildlife-grid/gray-squirrel.png", artAlt: "Gray squirrel illustration",
    warmth: "We know the scratching overhead can wear on your peace. We’ll show you what we found and walk through the plan.",
    answerTitle: "Why are squirrels getting into the attic?",
    answer: "Squirrels may use roofline gaps, vents, soffits, fascia, or other vulnerable areas. Gray and flying squirrels can create different patterns of activity. The inspection should identify the animal, the route in, and any timing considerations before removal or repair begins.",
    facts: [
      ["Gray squirrels", "Often noticed during daytime activity. Roofline access and nesting areas should be inspected before work is planned."],
      ["Flying squirrels", "Often active at night and may live in groups. Latrine areas and disturbed insulation can be part of the inspection."],
      ["Season-aware", "Dependent young can change how removal should be handled. The site findings and applicable wildlife rules guide the plan."]
    ],
    features: [
      ["Identify the animal", "Use timing, sound, droppings, nesting, and access evidence to distinguish gray from flying squirrels."],
      ["Choose a humane method", "Match the removal approach to the animal, building, season, and inspection findings."],
      ["Repair the route in", "Scope vulnerable openings only after the active-animal plan is clear."],
      ["Review nearby weak points", "Document adjacent roofline or ventilation areas that may need attention."],
      ["Assess cleanup", "Review insulation disturbance, nesting material, and latrine areas before recommending cleanup."],
      ["Explain the warranty", "State the included repair areas, duration, renewal options, and exclusions in the written proposal."]
    ],
    faqs: [
      ["How can I tell gray squirrels from flying squirrels?", "Daytime versus nighttime activity can be a clue, but an inspection should use multiple signs before confirming the animal."],
      ["Can you seal the opening right away?", "The active-animal and dependent-young situation should be resolved before a primary route is closed. The technician should explain the sequence for the property."],
      ["Do squirrels damage attics?", "Squirrels can disturb insulation and gnaw materials. The inspection documents actual conditions rather than assuming damage."],
      ["What happens after removal?", "The next steps may include repair, sanitation, monitoring, and a written warranty for the included work."]
    ],
    articles: [articles.squirrelAttic, articles.squirrelFacts, articles.squirrelBehavior]
  },
  {
    kind: "animal", slug: "wildlife/raccoon", key: "raccoon",
    name: "Raccoon Removal", title: "Raccoon Removal in Metro ATL", outlined: "Raccoon", second: "Removal",
    eyebrow: "Humane Inspection · Removal · Repair",
    description: "Humane raccoon removal in Metro Atlanta, with attic and roofline inspection, a plan for adults or dependent young, entry-point repair, and cleanup options.",
    logo: "/assets/images/page-logos/raccoon.png", art: "/assets/images/animals/raccoon-optimized.webp", artAlt: "ASAP illustrated raccoon",
    warmth: "A raccoon in the attic feels personal. We respond calmly, protect the home, and explain each decision.",
    answerTitle: "What should I do if I suspect a raccoon?",
    answer: "Avoid cornering or handling the animal. Note where and when you hear activity, keep people and pets away from the area, and arrange an inspection. The plan should account for access, possible young, contamination, repair, and applicable wildlife rules.",
    facts: [
      ["Possible family group", "Season and inspection evidence may indicate dependent young. That changes the removal sequence."],
      ["Strong entry pressure", "Raccoons can exploit or enlarge weak roofline areas. Repair scope should follow inspection."],
      ["Cleanup decision", "Droppings, nesting material, or damaged insulation require an evidence-based cleanup recommendation."]
    ],
    features: [
      ["Confirm activity", "Identify signs, likely access, and whether the animal is active in the structure."],
      ["Plan humane removal", "Account for adult animals, possible young, building conditions, and legal requirements."],
      ["Repair entry areas", "Document and price included repair areas after the removal sequence is established."],
      ["Assess contamination", "Evaluate droppings, nesting material, odor, and insulation before specifying cleanup."],
      ["Review vulnerable areas", "Show the homeowner nearby conditions that may deserve maintenance or monitoring."],
      ["Close with clarity", "Explain what was done, what remains, the warranty, and what the homeowner should watch."]
    ],
    faqs: [
      ["How do I know if a raccoon is in the attic?", "Heavy movement, nighttime activity, visible access damage, tracks, or droppings can be clues. Inspection should confirm the animal."],
      ["Can the entry hole be sealed immediately?", "Not until the active-animal and possible-young situation is understood. Closing an occupied route can create a more serious problem."],
      ["Do raccoon entry points get repaired?", "ASAP can scope repairs based on the inspection. The written proposal should identify included areas and warranty terms."],
      ["Do you serve the Metro Atlanta area?", "This page covers Metro Atlanta service intent. Availability for a specific address should be confirmed by phone or the quote form."]
    ],
    articles: [articles.raccoonHands, gap("Raccoon families in attics: what humane timing means"), gap("Raccoon cleanup and entry-point repair guide")]
  },
  {
    kind: "animal", slug: "wildlife/bats", key: "bat",
    name: "Bat and Guano Removal", title: "Bat Removal in Metro ATL", outlined: "Bat", second: "Removal",
    eyebrow: "Season-Aware Inspection and Exclusion",
    description: "Bat inspection, season-aware exclusion planning, guano removal, sanitation, insulation cleanup, and repair options for Metro Atlanta properties.",
    logo: "/assets/images/page-logos/bat.png", art: "/assets/images/wildlife-grid/bat.webp", artAlt: "ASAP illustrated bat",
    warmth: "Bats matter to Georgia’s ecosystem, and your home still needs to feel safe. The plan should respect both facts.",
    answerTitle: "Bat exclusions require a season-aware plan",
    answer: "Georgia wildlife guidance identifies April 1 through July 31 as a period when exclusions can risk trapping flightless young. That does not mean every bat-related service stops. Inspection, emergency response, interior containment, cleanup planning, and work allowed by current rules may still be appropriate. Site conditions and current guidance must be checked before exclusion.",
    facts: [
      ["Small crevices", "Bats can use narrow construction gaps. Inspection should trace actual travel and access rather than relying on one visible opening."],
      ["Guano and insulation", "Accumulation, affected insulation, and access constraints determine the cleanup scope and protective controls."],
      ["Disinfection products", "A disinfectant, sanitizer, or virucide such as a DSV-labeled product must be selected and used according to its current label and the site condition; it is not a blanket health guarantee."]
    ],
    features: [
      ["Observe and inspect", "Confirm bat activity, interior exposure, likely openings, colony signs, guano, and affected materials."],
      ["Plan the exclusion", "Choose timing and methods that account for dependent young, weather, site conditions, and current guidance."],
      ["Seal secondary gaps", "Address inactive openings while preserving the active exit strategy defined in the plan."],
      ["Complete repairs", "Close the primary route only after the exclusion phase is complete and verified."],
      ["Remove guano", "Scope containment, removal, disposal, and insulation work to the actual affected area."],
      ["Sanitize responsibly", "Use products and methods that fit the material and label; explain what cleaning can and cannot establish."]
    ],
    faqs: [
      ["Can I just wait?", "Waiting may be reasonable in some seasonal situations, but active interior exposure, contamination, or a bat in living space can require faster professional guidance. Call so the situation can be triaged."],
      ["Do I have to remove them now?", "Not every situation follows the same timeline. The colony, location, season, dependent-young risk, and current rules determine the safe sequence."],
      ["Do you put up bat houses?", "Bat houses may be discussed as a habitat-support option, but they do not replace exclusion or repair and do not guarantee bats will use them."],
      ["Why can’t every bat exclusion happen during maternity season?", "When young bats cannot fly, sealing or installing one-way exits can separate or trap them. Current Georgia guidance and the property-specific findings should control the timing."],
      ["What are the concerns with bat guano?", "Bat guano can support fungal growth in some conditions and can contaminate insulation or surfaces. Exposure risk depends on disturbance and site conditions; cleanup should use appropriate protective controls."],
      ["How do bats fit through tight gaps?", "Bats can use surprisingly narrow construction crevices. A careful inspection looks at rooflines, flashing, vents, trim, and other transitions where evidence is present."]
    ],
    articles: [articles.batsVisit, articles.batGuano, gap("Why bats are protected — and why maternity timing matters")]
  }
];

const cityProfiles = [
  { city: "Canton", slug: "wildlife-removal-canton", county: "Cherokee County", note: "Canton’s mix of established neighborhoods, newer construction, wooded edges, and roofline transitions creates varied pest and wildlife inspection conditions.", animals: ["Raccoons", "Gray squirrels", "Bats", "Rats", "Mice", "Birds"] },
  { city: "Woodstock", slug: "wildlife-removal-woodstock", county: "Cherokee County", note: "Woodstock properties range from dense neighborhoods to wooded lots, so service begins with the specific structure, access points, and signs on site.", animals: ["Raccoons", "Gray squirrels", "Bats", "Rats", "Mice", "Birds"] },
  { city: "Acworth", slug: "wildlife-removal-acworth", county: "Cobb and Bartow county context", note: "Acworth’s lake, creek, wooded, and suburban settings can create different wildlife pressure. The page keeps beavers in the local service mix in place of mice, per the client brief.", animals: ["Raccoons", "Gray squirrels", "Bats", "Rats", "Birds", "Beavers"] },
  { city: "Kennesaw", slug: "wildlife-removal-kennesaw", county: "Cobb County", note: "Kennesaw’s mature trees, rooflines, crawlspaces, and high-use outdoor areas make a site-specific inspection more useful than a one-size-fits-all treatment list.", animals: ["Raccoons", "Gray squirrels", "Bats", "Rats", "Mice", "Birds"] },
  { city: "Cartersville", slug: "wildlife-removal-cartersville", county: "Bartow County", note: "Cartersville properties can combine older construction, newer subdivisions, open land, and wooded corridors. The inspection connects the signs to the property.", animals: ["Raccoons", "Gray squirrels", "Bats", "Rats", "Mice", "Birds"] }
];

const pestIcons = {
  Ants: "⌁", Roaches: "◒", Termites: "◇", Mosquitoes: "⌁", Spiders: "✣", "Fleas and ticks": "•", "Bed bugs": "▰", "Stinging insects": "⬡"
};

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function baseSchema(page, faqs) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
        "@id": "https://removeasap.com/#business",
        name: "ASAP Pest & Wildlife Removal",
        url: "https://removeasap.com/",
        telephone: tel,
        areaServed: "Metro Atlanta, Georgia",
        image: "https://removeasap.com/assets/images/logos/logo-orange-tagline.png"
      },
      {
        "@type": "Service",
        "@id": `https://removeasap.com/${page.slug}/#service`,
        name: page.title,
        serviceType: page.name,
        provider: { "@id": "https://removeasap.com/#business" },
        areaServed: page.city ? `${page.city}, Georgia` : "Metro Atlanta, Georgia",
        url: `https://removeasap.com/${page.slug}/`,
        description: page.description
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://removeasap.com/" },
          { "@type": "ListItem", position: 2, name: page.city ? "Service Areas" : "Services", item: page.city ? "https://removeasap.com/services/" : "https://removeasap.com/wildlife/" },
          { "@type": "ListItem", position: 3, name: page.title, item: `https://removeasap.com/${page.slug}/` }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } }))
      }
    ]
  };
}

function head(page, faqs) {
  const canonical = `https://removeasap.com/${page.slug}/`;
  const cssVersion = page.key === "rodent" ? 4 : 3;
  return `<!doctype html>
<html lang="en" data-build-state="local-review">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(page.title)} | ASAP Pest &amp; Wildlife</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://removeasap.com/assets/images/logos/logo-orange-tagline.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/images/logos/favicon.png">
  <link rel="stylesheet" href="/assets/css/asap-close.css?v=${cssVersion}">
  <script type="application/ld+json">${json(baseSchema(page, faqs))}</script>
</head>`;
}

function header() {
  return `<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header"><div class="header-inner">
  <a class="brand" href="/" aria-label="ASAP Pest and Wildlife home"><img src="/assets/images/logos/logo-orange-tagline.png" width="340" height="203" alt="ASAP Pest and Wildlife Removal"></a>
  <nav aria-label="Main navigation"><ul class="nav-list"><li><a href="/wildlife/">Wildlife</a></li><li><a href="/pest-control-services/">Pest control</a></li><li><a href="/services/">Services</a></li><li><a href="/about/">About</a></li></ul></nav>
  <a class="call-pill" href="tel:${tel}" data-track="header-phone">Call ${phone}</a>
</div></header>`;
}

function hero(page) {
  return `<main id="main"><section class="hero texture"><div class="hero-inner">
  <div class="hero-copy"><p class="eyebrow">${esc(page.eyebrow)}</p><h1><span class="outline">${esc(page.outlined)}</span>${esc(page.second)}</h1><p class="lede">${esc(page.description)}</p><p>${esc(page.warmth)}</p>
  <div class="actions"><a class="button" href="#estimate">Request an inspection</a><a class="button button--ghost" href="tel:${tel}">Call ${phone}</a></div></div>
  <div class="hero-art"><img src="${page.art}" alt="${esc(page.artAlt)}" width="600" height="520" fetchpriority="high"><div class="art-note">Local/review build. Service availability, final scope, and any warranty are confirmed after inspection.</div></div>
</div></section>
<div class="proof-strip"><ul class="proof-list"><li><strong>Correct phone</strong><span>${phone}</span></li><li><strong>Calm, clear help</strong><span>Urgency without panic</span></li><li><strong>Full plan</strong><span>Inspect · control · repair · cleanup</span></li><li><strong>Metro Atlanta</strong><span>Address confirmed before service</span></li></ul></div>`;
}

function heading(kicker, title) {
  return `<div class="section-heading"><p class="kicker">${esc(kicker)}</p><h2>${esc(title)}</h2><div class="heading-rule" aria-hidden="true"></div></div>`;
}

function flashlight() {
  return `<div class="flashlight"><div class="flashlight-icon" aria-hidden="true"></div><div><h3>From evidence to a property-specific plan</h3><ol><li>Find active signs and access</li><li>Match the method to the animal</li><li>Scope repair and cleanup clearly</li></ol><p><strong>Warranty:</strong> any warranty applies only to the written work and terms included in the final proposal.</p></div></div>`;
}

function articleCards(items) {
  return `<div class="three-col">${items.map(([title, status, url]) => `<article class="article-card${url ? "" : " article-card--gap"}"><span class="status">${esc(status)}</span><h3>${esc(title)}</h3><p>${url ? "Educational reading from ASAP’s existing article inventory." : "A source-backed brief is scaffolded in the editorial gap inventory. This is not silently treated as published."}</p>${url ? `<a href="${url}" rel="noopener noreferrer">Read the existing article <span aria-hidden="true">→</span></a>` : `<span>Editorial source review required before publication</span>`}</article>`).join("")}</div>`;
}

function intentRouter(page) {
  if (!page.intentRoutes?.length) return "";
  return `<section class="section section--white intent-router" aria-labelledby="intent-router-title" data-intent-role="umbrella-support"><div class="container">
  ${heading("Choose the right service page", "What are you hearing or finding?")}
  <p class="lead narrow" id="intent-router-title">The broad Rodent page helps you sort the first clues. It does not replace the specific Rat + Mouse, Squirrel, Raccoon, or Bat service pages.</p>
  <div class="intent-grid">${page.intentRoutes.map((route) => `<article class="intent-card" data-intent-target="${esc(route.target)}"><span class="intent-label">${esc(route.label)}</span><h3>${esc(route.title)}</h3><p>${esc(route.description)}</p><a href="${route.href}">${esc(route.cta)} <span aria-hidden="true">→</span></a></article>`).join("")}</div>
  <aside class="source-note" aria-label="Identification, cleanup, and bat-guidance source note"><strong>Clues are not a diagnosis.</strong> UGA Extension notes that attic noise can come from mice, bats, squirrels, raccoons, and other wildlife, and that time of day is only one clue. CDC says not to sweep or vacuum dry rodent waste. Inspection and current guidance determine the service path. <a href="https://extension.uga.edu/publications/detail.html?number=B1248&amp;title=resolving-human-nuisance-wildlife-conflicts" rel="noopener noreferrer">UGA identification guidance</a> · <a href="https://www.cdc.gov/healthy-pets/rodent-control/clean-up.html" rel="noopener noreferrer">CDC cleanup guidance</a> · <a href="https://georgiawildlife.com/index.php/ExcludingBatsFromYourHouse" rel="noopener noreferrer">Georgia DNR bat guidance</a></aside>
  </div></section>`;
}

function reviews() {
  const cards = [
    ["The service was excellent. Arrived on time and gave me a detailed overview of the problem and repair options.", "Mark Carroll"],
    ["The work was completed quickly and thoroughly. Chaz was professional and wonderful to work with.", "Kelsey Monaghan"],
    ["Highly skilled and professional technicians. I’d recommend ASAP.", "Fred Perry"]
  ];
  return `<section class="section texture" aria-labelledby="reviews-title"><div class="container">${heading("What homeowners say", "Real review excerpts")}
  <div class="three-col">${cards.map(([quote, name]) => `<article class="review-card"><a href="${reviewUrl}" target="_blank" rel="noopener noreferrer"><div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p>“${esc(quote)}”</p><cite>${esc(name)}</cite></a></article>`).join("")}</div>
  <div class="actions"><a class="button" href="${reviewUrl}" target="_blank" rel="noopener noreferrer">Read Google reviews</a></div></div></section>`;
}

function faqs(items, title) {
  return `<section class="section texture" aria-labelledby="faq-title"><div class="container"><div class="section-heading"><p class="kicker">${esc(title)} FAQ</p><h2 id="faq-title">Common Questions</h2><div class="heading-rule" aria-hidden="true"></div></div><div class="faq-list">${items.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("")}</div></div></section>`;
}

function form(page) {
  const logo = page.logo || "/assets/images/logos/logo-orange-tagline.png";
  const source = `/${page.slug}/`;
  return `<section id="estimate" class="section section--navy"><div class="container contact-shell">
  <div class="contact-copy"><img class="service-lockup" src="${logo}" width="320" height="220" alt="${esc(page.name)}"><p class="kicker">Talk with the ASAP team</p><h2>Contact us for an estimate!</h2><p>Tell us what you’re seeing or hearing. We’ll help identify the right next step.</p><p><a href="tel:${tel}">${phone}</a><br><span>info@removeasap.com</span></p><span class="review-mode">Local/review fixture — no external delivery</span></div>
  <form class="lead-form" action="/api/lead-intent" method="post" data-asap-lead-form data-source-page="${source}" data-page-type="${page.city ? "city" : page.kind}" data-service="${esc(page.name)}" data-city="${esc(page.city || "")}" data-integration-state="fixture-only">
    <input type="hidden" name="lead_id"><input type="hidden" name="source_page"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="gclid"><input type="hidden" name="fbclid">
    <div class="field"><input id="first-${page.key || page.slug}" name="first_name" autocomplete="given-name" required><label for="first-${page.key || page.slug}">First name*</label></div>
    <div class="field"><input id="last-${page.key || page.slug}" name="last_name" autocomplete="family-name" required><label for="last-${page.key || page.slug}">Last name*</label></div>
    <div class="field"><input id="phone-${page.key || page.slug}" name="phone" type="tel" autocomplete="tel" required><label for="phone-${page.key || page.slug}">Phone*</label></div>
    <div class="field"><input id="email-${page.key || page.slug}" name="email" type="email" autocomplete="email" required><label for="email-${page.key || page.slug}">Email*</label></div>
    <div class="field field--full"><select id="issue-${page.key || page.slug}" name="issue" required><option value="">Select one…</option><option>Wildlife removal</option><option>Rat or mouse</option><option>Squirrel</option><option>Raccoon</option><option>Bat or guano</option><option>Pest control</option><option>Other</option></select><label for="issue-${page.key || page.slug}">I need peace with…*</label></div>
    <div class="field field--full"><textarea id="details-${page.key || page.slug}" name="details" maxlength="1200"></textarea><label for="details-${page.key || page.slug}">What are you noticing?</label></div>
    <label class="consent"><input name="sms_consent" type="checkbox" required><span>I agree to receive messages about my inquiry. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Review our <a href="/privacy-policy/">Privacy Policy</a>. *</span></label>
    <button class="button button--cream" type="submit">Validate review fixture</button><p class="form-status" tabindex="-1" role="status" aria-live="polite" data-form-status>Submitting here never contacts a client or creates a live CRM record.</p>
  </form></div></section>`;
}

function footer() {
  return `</main><footer class="site-footer"><div class="footer-inner"><span>© ASAP Pest &amp; Wildlife Removal</span><span><a href="/privacy-policy/">Privacy</a> · <a href="/terms-of-service/">Terms</a> · <a href="tel:${tel}">${phone}</a></span></div></footer><script src="/assets/js/asap-close.js" defer></script></body></html>`;
}

function renderAnimal(page) {
  return `${head(page, page.faqs)}${header()}${hero(page)}
  <section class="section texture"><div class="container two-col"><div>${heading("Answer first", page.answerTitle)}<p class="lead">${esc(page.answer)}</p></div><dl class="fact-list">${page.facts.map(([term, desc]) => `<div><dt>${esc(term)}</dt><dd>${esc(desc)}</dd></div>`).join("")}</dl></div></section>${intentRouter(page)}
  <section class="section section--white"><div class="container">${heading("Inspection pattern", "See the route, then choose the work")}${flashlight()}</div></section>
  <section class="section section--navy"><div class="container">${heading("A complete service conversation", "What the plan can cover")}<div class="feature-grid">${page.features.map(([title, desc]) => `<article class="feature-card"><h3>${esc(title)}</h3><p>${esc(desc)}</p></article>`).join("")}</div></div></section>
  <section class="section texture"><div class="container">${heading("Learn before you decide", "Three useful next reads")}${articleCards(page.articles)}</div></section>
  ${reviews()}${faqs(page.faqs, page.title)}${form(page)}${footer()}`;
}

function animalArt(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes("raccoon")) return "/assets/images/wildlife-grid/raccoon.png";
  if (normalized.includes("squirrel")) return "/assets/images/wildlife-grid/gray-squirrel.png";
  if (normalized.includes("bat")) return "/assets/images/wildlife-grid/bat.webp";
  if (normalized.includes("rat")) return "/assets/images/animals/rat-navy-optimized.webp";
  if (normalized.includes("mice")) return "/assets/images/wildlife-grid/mouse-rat.png";
  if (normalized.includes("bird")) return "/assets/images/vendor/61d9063dde23d80b1d80aa9f-bird-p-500-9018e5be37b8bc92.webp";
  if (normalized.includes("beaver")) return "/assets/images/wildlife-grid/beaver.png";
  return "/assets/images/animals/rat-navy-optimized.webp";
}

function countyMap(profile) {
  return `<svg class="service-map" viewBox="0 0 520 340" role="img" aria-labelledby="map-${profile.slug}-title map-${profile.slug}-desc"><title id="map-${profile.slug}-title">${esc(profile.city)} county service context</title><desc id="map-${profile.slug}-desc">Schematic local review map showing ${esc(profile.city)} in ${esc(profile.county)}. It is not a legal boundary map.</desc><path class="county" d="M70 45 L425 35 L480 128 L420 285 L155 305 L50 205 Z"></path><circle class="city-dot" cx="270" cy="165" r="11"></circle><text x="287" y="160" font-size="22" font-weight="700">${esc(profile.city)}</text><text x="287" y="187" font-size="15">${esc(profile.county)}</text><text x="70" y="326" font-size="13">Schematic service context — review only</text></svg>`;
}

function cityFaqs(city) {
  return [
    [`Do you provide pest and wildlife removal in ${city}?`, `This local/review page covers service intent in ${city}. Availability for a specific address, service, and schedule must be confirmed by the ASAP team.`],
    ["What happens during an inspection?", "The technician reviews signs, likely access, affected areas, site conditions, and the service requested. The proposal should separate control, removal, repair, cleanup, and recurring work."],
    ["Do you handle both pests and wildlife?", "ASAP offers pest-control and wildlife-removal services. The exact service, method, schedule, and warranty depend on the inspection and written scope."],
    ["Can I request service online?", "The quote form captures page, city, service, campaign, and click context for the future integration contract. In this local/review build it validates only and sends nothing."]
  ];
}

function renderCity(profile) {
  const page = {
    kind: "city", key: profile.slug, slug: profile.slug, city: profile.city,
    name: `Pest and Wildlife Removal in ${profile.city}`,
    title: `Pest and Wildlife Removal in ${profile.city}, Georgia`,
    outlined: profile.city, second: "Pest + Wildlife", eyebrow: `${profile.county} service page`,
    description: `Local pest control and humane wildlife removal information for ${profile.city}, Georgia, with inspection-led service options and a direct path to the ASAP team.`,
    art: "/assets/images/logos/services-hero-mascot.png", artAlt: "ASAP Pest and Wildlife mascot",
    warmth: `When something unfamiliar shows up at your ${profile.city} property, you deserve a calm answer and a plan that fits the site.`
  };
  const cityFaqItems = cityFaqs(profile.city);
  const pests = ["Ants", "Roaches", "Termites", "Mosquitoes", "Spiders", "Fleas and ticks"];
  return `${head(page, cityFaqItems)}${header()}${hero(page)}
  <section class="section texture"><div class="container two-col"><div>${heading("Local answer", `A property-specific plan for ${profile.city}`)}<p class="lead">${esc(profile.note)}</p><p>ASAP starts with what is actually happening at the property. The inspection connects the signs to the service, repair, cleanup, or monitoring options that may belong in the proposal.</p></div><div class="map-card">${countyMap(profile)}<p class="map-note">County context is schematic and must be checked before production. It does not define a guaranteed service boundary.</p></div></div></section>
  <section class="section section--white"><div class="container">${heading("Inspection pattern", "From evidence to a property-specific plan")}${flashlight()}</div></section>
  <section class="section texture"><div class="container">${heading("Wildlife services", `Six animals featured in ${profile.city}`)}<div class="animal-grid">${profile.animals.map((animal) => `<article class="animal-card"><img src="${animalArt(animal)}" alt="" width="96" height="84" loading="lazy"><div><h3>${esc(animal)}</h3><p>Inspection-led removal and property guidance for signs involving ${esc(animal.toLowerCase())}.</p></div></article>`).join("")}</div></div></section>
  <section class="section section--navy"><div class="container">${heading("Dedicated pest-control section", `Pest control for ${profile.city} properties`)}<p class="lead narrow">Pest control is its own service path. The plan should identify the pest, affected area, contributing conditions, treatment method, follow-up, safety context, and any recurring schedule.</p><div class="pest-grid">${pests.map((pest) => `<article class="feature-card"><h3>${esc(pest)}</h3><p>Identification, treatment planning, prevention guidance, and follow-up shaped to the property.</p></article>`).join("")}</div><div class="actions"><a class="button button--cream" href="/pest-control-services/">Explore pest control</a></div></div></section>
  ${reviews()}${faqs(cityFaqItems, page.title)}${form(page)}${footer()}`;
}

function renderPest() {
  const page = {
    kind: "pest-control", key: "pest-control", slug: "pest-control-services", city: "",
    name: "Pest Control", title: "Pest Control Services in Metro Atlanta", outlined: "Pest", second: "Control", eyebrow: "Identification · Treatment · Prevention · Follow-up",
    description: "Pest control services for Metro Atlanta homes and businesses, with identification-led treatment plans, prevention guidance, recurring options, and clear follow-up.",
    art: "/assets/images/logos/pest-hero-mascot.png", artAlt: "ASAP pest-control mascot", warmth: "You don’t need a wall of jargon. You need to know what the pest is, what the plan does, and what happens next."
  };
  const pestFaqItems = [
    ["What pests does ASAP handle?", "The current service pattern includes ants, roaches, termites, mosquitoes, spiders, fleas and ticks, bed bugs, and stinging insects. Exact availability is confirmed for the property."],
    ["Is pest control a one-time or recurring service?", "Some conditions may fit a one-time treatment while others benefit from recurring inspection and service. The recommendation should explain the reason, frequency, and stop or review point."],
    ["How are products selected?", "Product and method selection should follow pest identification, site conditions, label requirements, and household or business context, including children, pets, and sensitive areas."],
    ["Can pest control be combined with wildlife service?", "Yes, when both needs exist, but the proposal should keep each scope, method, cadence, and warranty clear."]
  ];
  const pests = ["Ants", "Roaches", "Termites", "Mosquitoes", "Spiders", "Fleas and ticks", "Bed bugs", "Stinging insects"];
  return `${head(page, pestFaqItems)}${header()}${hero(page)}
  <section class="section texture"><div class="container">${heading("Choose the right service path", "Common pest-control needs")}<div class="feature-grid">${pests.map((pest) => `<article class="feature-card"><h3><span aria-hidden="true">${pestIcons[pest] || "•"}</span> ${esc(pest)}</h3><p>Identify the pest and affected area before selecting treatment, prevention, and follow-up.</p></article>`).join("")}</div></div></section>
  <section class="section section--navy"><div class="container">${heading("A clear pattern", "Identify. Treat. Prevent. Review.")}<div class="process-grid"><article class="process-card"><h3>Identify</h3><p>Confirm the pest, the activity, and the affected area.</p></article><article class="process-card"><h3>Treat</h3><p>Select a method that fits the site and current label.</p></article><article class="process-card"><h3>Prevent</h3><p>Address contributing conditions and practical maintenance.</p></article><article class="process-card"><h3>Review</h3><p>Document results, follow-up, and the next decision point.</p></article></div></div></section>
  <section class="section texture"><div class="container two-col"><div>${heading("Recurring service", "Monitoring with a reason") }<p class="lead">Recurring pest service should have a defined pest, cadence, inspection routine, treatment standard, record, and review point. It should not become an unexplained subscription.</p></div><div class="answer-card"><h3>Shared city-page pattern</h3><p>Each of the five city pages includes a dedicated pest-control section that links back to this service hub. The city page owns local mixed-service intent; this page owns the broader Metro Atlanta pest-control category.</p></div></div></section>
  ${faqs(pestFaqItems, page.title)}${form(page)}${footer()}`;
}

function write(relative, content) {
  const path = join(root, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

for (const page of animals) write(`${page.slug}/index.html`, renderAnimal(page));
for (const profile of cityProfiles) write(`${profile.slug}/index.html`, renderCity(profile));
write("pest-control-services/index.html", renderPest());

const inventory = {
  generated_at: "2026-08-13",
  state: "local-review",
  requirement: "Three related article slots per core animal page; gaps are explicit and not fabricated as published.",
  pages: animals.map((page) => ({ page: `/${page.slug}/`, service: page.name, slots: page.articles.map(([title, status, url]) => ({ title, status, url: url || null })) })),
  bat_backlog: [
    { title: "Bat maternity timeline, migration, protection, and why timing matters", status: "gap-needs-source-review" },
    { title: "Danger of guano", status: "existing-article-needs-editorial-validation", candidate: articles.batGuano[2] },
    { title: "Why bats are protected", status: "gap-needs-source-review" },
    { title: "Cool facts about bats", status: "gap-needs-source-review" }
  ],
  held_gate: "No missing article is represented as written, approved, or published. Existing Medium content also needs editorial and claim review before production attachment."
};
write("content/asap-article-inventory.json", `${JSON.stringify(inventory, null, 2)}\n`);

console.log(JSON.stringify({ ok: true, pages: animals.length + cityProfiles.length + 1, animals: animals.map((x) => x.slug), cities: cityProfiles.map((x) => x.slug), pest: "pest-control-services" }));
