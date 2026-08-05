import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phoneHref = '7704501744';
const phoneLabel = '(770) 450-1744';

const pages = [
  {
    file: 'wildlife/raccoon/index.html',
    title: 'Raccoon Removal Atlanta, GA | ASAP Pest & Wildlife',
    description: 'Raccoon removal for Metro Atlanta homes and businesses. ASAP inspects entry points, develops a removal plan, and helps protect vulnerable rooflines and openings.',
    eyebrow: 'Metro Atlanta raccoon control',
    h1: 'Raccoon Removal in Atlanta, GA',
    lede: 'Hearing heavy movement above the ceiling or finding damage near a roof edge? ASAP Pest & Wildlife Removal helps Metro Atlanta property owners identify raccoon activity, address the immediate problem, and plan the repairs that help keep wildlife out.',
    image: '/assets/images/animals/raccoon-optimized.webp',
    imageAlt: 'Raccoon illustration for ASAP raccoon removal services',
    signsIntro: 'Raccoons are strong, persistent animals. The useful first step is identifying how they are using the property—not guessing from a single noise.',
    signs: [
      ['Heavy nighttime movement', 'Thumping, walking, or vocal sounds in an attic, chimney, crawlspace, or above a ceiling can point to a larger animal.'],
      ['Roofline damage', 'Bent vents, disturbed soffits, loose fascia, or damage around a roof return can become an active entry point.'],
      ['Tracks and droppings', 'Prints, droppings, disturbed insulation, or a concentrated odor can help locate the active area.'],
    ],
    process: [
      ['Inspect the structure', 'We look for activity, travel routes, vulnerable openings, and evidence that helps define the scope.'],
      ['Build the removal plan', 'The approach is based on the animal, location, access conditions, and applicable wildlife rules.'],
      ['Address entry points', 'After the active problem is resolved, repair and exclusion work can close the openings wildlife used.'],
      ['Discuss cleanup needs', 'Contaminated or disturbed areas can be evaluated so the next step matches the condition found.'],
    ],
    splitKicker: 'Act on the evidence',
    splitTitle: 'What to do when you suspect a raccoon',
    splitIntro: 'Avoid cornering, handling, or sealing an animal inside. Give the team a clear description of what you are hearing or seeing and where it occurs.',
    checklist: [
      'Note the time, location, and type of noise or activity.',
      'Photograph visible exterior damage from a safe location.',
      'Keep people and pets away from the suspected access area.',
      'Arrange an inspection before closing an opening yourself.',
    ],
    note: 'Raccoon work should follow Georgia wildlife-control requirements. The on-site findings determine the appropriate removal and repair sequence.',
    faqs: [
      ['How do I know whether the animal in my attic is a raccoon?', 'Raccoons often create heavier, slower movement than rodents or squirrels, but sound alone is not a reliable identification. Tracks, entry damage, droppings, and a structural inspection help confirm the animal.'],
      ['Can I seal the opening as soon as I find it?', 'Not until the active situation is understood. Closing an occupied entry can trap wildlife inside or separate a mother from young. Inspection should come first.'],
      ['Does ASAP repair raccoon entry points?', 'ASAP evaluates the openings and damage connected to the wildlife activity. The recommended removal, repair, exclusion, and cleanup scope depends on what the inspection finds.'],
      ['Where does ASAP provide raccoon removal?', 'ASAP serves Metro Atlanta and communities outside the perimeter. Call with the property address so the team can confirm coverage.'],
    ],
  },
  {
    file: 'wildlife/bats/index.html',
    title: 'Bat Removal Atlanta, GA | Humane Bat Exclusion | ASAP',
    description: 'Bat inspection and exclusion planning for Metro Atlanta structures. Learn the signs of a bat colony and Georgia\'s April 1–July 31 maternity-season restrictions.',
    eyebrow: 'Bat inspection and exclusion',
    h1: 'Bat Removal in Atlanta, GA',
    lede: 'Bats can enter through small roofline gaps and establish a roost where it is difficult to see. ASAP Pest & Wildlife Removal helps identify exits, evaluate the roost, and plan humane exclusion and repair work around Georgia’s seasonal rules.',
    image: '/assets/images/wildlife-grid/bat.webp',
    imageAlt: 'Bat in flight for ASAP bat exclusion services',
    signsIntro: 'A bat seen outdoors is not automatically a structure problem. These clues can indicate that bats are entering or roosting in a building.',
    signs: [
      ['Dusk activity at one opening', 'Bats repeatedly emerging from a roof edge, vent, chimney area, or siding gap at dusk can reveal an active exit.'],
      ['Staining near a gap', 'Dark rub marks around a small opening may show a frequently used route into the structure.'],
      ['Guano below a roost', 'Small droppings on a wall, roof, attic floor, or the ground below an opening can point to activity above.'],
    ],
    process: [
      ['Observe and inspect', 'We evaluate the building, likely exits, roost evidence, and conditions that affect safe timing.'],
      ['Plan the exclusion', 'One-way exclusion lets bats leave while preventing return; the exact plan follows the site and season.'],
      ['Seal secondary gaps', 'Other accessible openings are addressed so the colony cannot simply shift to a nearby part of the structure.'],
      ['Complete repairs and cleanup', 'After the exclusion is confirmed, final closure and any needed guano-related work can be scoped.'],
    ],
    splitKicker: 'Georgia timing matters',
    splitTitle: 'Bat exclusions require a season-aware plan',
    splitIntro: 'Georgia DNR says colony exclusions should be avoided from April 1 through July 31 because flightless young may be present. During this maternity period, any necessary exclusion requires the appropriate state-permitted operator and site-specific evaluation.',
    checklist: [
      'Do not poison, trap, or seal bats inside a structure.',
      'Record where bats emerge and approximately when you see them.',
      'Keep people and pets away from any bat found indoors.',
      'Let an inspection determine whether exclusion can proceed now.',
    ],
    note: 'Timing is not a blanket promise of immediate exclusion. The roost, current activity, maternity season, weather, and Georgia requirements all affect the proper next step.',
    faqs: [
      ['When can bats be excluded from a Georgia home?', 'Georgia DNR advises avoiding colony exclusion from April 1 through July 31, when young bats may be unable to fly. A qualified inspection determines the lawful and humane next step for the specific property.'],
      ['What is a one-way bat exclusion?', 'A one-way device allows bats to leave a structure but prevents them from re-entering. Other gaps must be addressed as part of the plan, and final closure happens only after exit is confirmed.'],
      ['Should I close a bat opening during the daytime?', 'No. Bats may still be inside, and young bats may be unable to leave. Closing the opening without an inspection can trap animals in the structure.'],
      ['Where does ASAP provide bat removal?', 'ASAP serves Metro Atlanta and surrounding communities. Call with the property address and a description of the activity so the team can confirm coverage.'],
    ],
  },
  {
    file: 'wildlife/gray-squirrel/index.html',
    title: 'Squirrel Removal Atlanta, GA | Attic Exclusion | ASAP',
    description: 'Squirrel removal and entry-point inspection for Metro Atlanta properties. ASAP helps identify attic activity, remove wildlife, and address vulnerable roofline openings.',
    eyebrow: 'Gray and flying squirrel control',
    h1: 'Squirrel Removal in Atlanta, GA',
    lede: 'Scratching and fast movement above the ceiling often begin with a small roofline opening. ASAP Pest & Wildlife Removal helps Metro Atlanta property owners identify squirrel activity, choose the right removal approach, and address the access points behind the problem.',
    image: '/assets/images/animals/squirrel-optimized.webp',
    imageAlt: 'Squirrel illustration for ASAP squirrel removal services',
    signsIntro: 'Gray squirrels are usually active by day; flying squirrels are more often heard at night. An inspection separates squirrel evidence from rat, mouse, bird, and raccoon activity.',
    signs: [
      ['Fast attic movement', 'Running, rolling, or scratching sounds near the roofline can suggest an animal traveling through insulation or framing.'],
      ['Gnawed openings', 'Damage around fascia, soffits, vents, eaves, or roof returns can create a repeat route into the attic.'],
      ['Nesting material', 'Leaves, shredded material, droppings, or disturbed insulation can help locate the active zone.'],
    ],
    process: [
      ['Identify the animal', 'Activity patterns, entry damage, droppings, and the location of evidence help confirm the species.'],
      ['Choose the removal method', 'The plan accounts for access, young animals, and Georgia-approved methods for gray and flying squirrels.'],
      ['Repair the route in', 'Once the active problem is handled, exclusion and repair work addresses the openings squirrels used.'],
      ['Review vulnerable areas', 'Nearby roof transitions, vents, and trim can be evaluated so the plan is not limited to one visible hole.'],
    ],
    splitKicker: 'Protect the roofline',
    splitTitle: 'Removal works best when the entry problem is addressed',
    splitIntro: 'Removing an animal without dealing with the access point leaves the structure vulnerable. The inspection connects the activity inside with the route outside.',
    checklist: [
      'Note whether the sounds happen during the day or at night.',
      'Look for visible roofline damage from the ground.',
      'Avoid blocking an opening before checking for young animals.',
      'Trim or maintenance decisions can follow the structural findings.',
    ],
    note: 'The exact removal and exclusion sequence depends on species, season, young animals, and site access. Inspection comes before a repair promise.',
    faqs: [
      ['Are the sounds in my attic squirrels or rats?', 'Daytime running near the roofline can suggest gray squirrels, while nighttime activity may point to flying squirrels or rodents. Droppings, gnawing, tracks, and entry-point evidence are more reliable than sound alone.'],
      ['Can squirrels return after removal?', 'An unresolved or poorly repaired opening can be reused. A complete plan looks at removal and the structural route that allowed access.'],
      ['Does ASAP handle flying squirrels too?', 'The page covers both gray and flying squirrel concerns. The inspection identifies the likely species and helps determine the appropriate approach.'],
      ['Where does ASAP provide squirrel removal?', 'ASAP serves Metro Atlanta and communities outside the perimeter. Call with the property address so the team can confirm coverage.'],
    ],
  },
  {
    file: 'wildlife/mouse-rat/index.html',
    title: 'Rat & Mouse Removal Atlanta, GA | Rodent Control | ASAP',
    description: 'Rat and mouse removal for Metro Atlanta homes and businesses. ASAP inspects rodent activity, identifies entry points, and builds a control and exclusion plan.',
    eyebrow: 'Metro Atlanta rodent control',
    h1: 'Rat &amp; Mouse Removal in Atlanta, GA',
    lede: 'Rodent activity is rarely solved by treating the one place you happened to see it. ASAP Pest & Wildlife Removal traces signs through attics, crawlspaces, kitchens, storage areas, and exterior openings to build a plan around the whole property.',
    image: '/assets/images/animals/rat-navy-optimized.webp',
    imageAlt: 'Rat illustration for ASAP rodent removal services',
    signsIntro: 'Mice and rats can travel behind walls and through small openings. The pattern of evidence helps identify where to inspect and what must be corrected.',
    signs: [
      ['Droppings and rub marks', 'Location, size, and concentration can help distinguish active travel areas from old evidence.'],
      ['Gnawing or scratching', 'Damage to stored materials or sounds in walls, ceilings, and cabinets can indicate an active route.'],
      ['Food and nesting activity', 'Disturbed packages, shredded material, or nesting debris can reveal where rodents are feeding or sheltering.'],
    ],
    process: [
      ['Inspect activity zones', 'We assess interior evidence, exterior openings, food and water sources, and routes between them.'],
      ['Build the control plan', 'The approach matches the property, likely species, extent of activity, and conditions found.'],
      ['Address entry points', 'Exclusion work focuses on accessible gaps and penetrations rodents can use to re-enter.'],
      ['Monitor and adjust', 'Follow-up evidence shows whether activity is declining and whether another route needs attention.'],
    ],
    splitKicker: 'Solve the route, not one sighting',
    splitTitle: 'A rodent plan connects control with exclusion',
    splitIntro: 'Traps can address animals already inside, but access, shelter, and food conditions can sustain the problem. Inspection ties those pieces together.',
    checklist: [
      'Store food and pet food in closed, durable containers.',
      'Photograph droppings or damage before cleaning the area.',
      'Avoid sweeping or vacuuming dry droppings without proper precautions.',
      'Share where and when activity has been seen or heard.',
    ],
    note: 'A property may have mice, roof rats, Norway rats, or more than one activity area. The recommended scope should follow the evidence rather than assume a single solution.',
    faqs: [
      ['How can I tell whether I have mice or rats?', 'Dropping size, gnaw marks, tracks, travel patterns, and entry openings all help. An inspection is more reliable than identifying the animal from a brief sighting.'],
      ['Is trapping enough to solve a rodent problem?', 'Trapping can be part of the plan, but openings, food sources, nesting conditions, and exterior routes may also need attention to reduce repeat activity.'],
      ['Why do I still hear rodents after sealing one hole?', 'There may be another route, or animals may have been sealed inside. A complete inspection should map accessible openings before the exclusion sequence is finalized.'],
      ['Where does ASAP provide rat and mouse removal?', 'ASAP serves Metro Atlanta and surrounding communities. Call with the property address so the team can confirm coverage.'],
    ],
  },
];

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function addFormLabels(html) {
  // Some legacy Webflow inputs end in `"/`; normalize that slash before
  // inserting an accessible name so the generated attribute stays valid HTML.
  html = html.replace(/(<input\b[^>]*)\/ aria-label=/g, '$1 aria-label=');
  const labels = {
    'First-Name': 'First name',
    'Last-Name': 'Last name',
    Company: 'Company',
    'Phone-2': 'Phone',
    Email: 'Email',
    Address: 'Street address',
    City: 'City',
    State: 'State',
    ZipCode: 'ZIP code',
  };
  for (const [id, label] of Object.entries(labels)) {
    const pattern = new RegExp(`(<input\\b[^>]*\\bid="${id}"[^>]*)(>)`, 'g');
    html = html.replace(pattern, (match, start, end) => match.includes('aria-label=') ? match : `${start} aria-label="${label}"${end}`);
  }
  return html;
}

function renderPage(page) {
  const cards = page.signs.map(([title, body]) => `<article class="bwm-animal-card"><h3>${title}</h3><p>${body}</p></article>`).join('');
  const process = page.process.map(([title, body]) => `<article class="bwm-process-step"><h3>${title}</h3><p>${body}</p></article>`).join('');
  const checklist = page.checklist.map((item) => `<li>${item}</li>`).join('');
  const faqs = page.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join('');
  return `<!-- BWM_NEHEMIAH_ANIMAL_START -->
<main class="bwm-animal-service" id="main-content">
  <section class="bwm-animal-hero">
    <div class="bwm-animal-shell bwm-animal-hero-grid">
      <div>
        <p class="bwm-animal-eyebrow">${page.eyebrow}</p>
        <h1>${page.h1}</h1>
        <p class="bwm-animal-lede">${page.lede}</p>
        <div class="bwm-animal-actions">
          <a class="bwm-animal-button" href="tel:${phoneHref}">Call ${phoneLabel}</a>
          <a class="bwm-animal-button secondary" href="/contact/">Request an inspection</a>
        </div>
      </div>
      <div class="bwm-animal-visual"><img src="${page.image}" alt="${page.imageAlt}" width="520" height="420" fetchpriority="high"></div>
    </div>
  </section>
  <div class="bwm-trust-strip"><div class="bwm-animal-shell bwm-trust-grid"><p>Metro Atlanta service area</p><p>Inspection-led recommendations</p><p>Removal + entry-point planning</p></div></div>
  <section class="bwm-animal-section paper">
    <div class="bwm-animal-shell">
      <p class="bwm-animal-kicker">What to look for</p>
      <h2>Signs that deserve a closer inspection</h2>
      <p class="bwm-section-intro">${page.signsIntro}</p>
      <div class="bwm-card-grid">${cards}</div>
    </div>
  </section>
  <section class="bwm-animal-section navy">
    <div class="bwm-animal-shell">
      <p class="bwm-animal-kicker">The ASAP approach</p>
      <h2>From evidence to a property-specific plan</h2>
      <p class="bwm-section-intro">The right sequence depends on what is active, how the animal entered, and what the structure needs after removal.</p>
      <div class="bwm-process-grid">${process}</div>
    </div>
  </section>
  <section class="bwm-animal-section">
    <div class="bwm-animal-shell bwm-animal-split">
      <div>
        <p class="bwm-animal-kicker">${page.splitKicker}</p>
        <h2>${page.splitTitle}</h2>
        <p class="bwm-section-intro">${page.splitIntro}</p>
        <p class="bwm-animal-note">${page.note}</p>
      </div>
      <ul class="bwm-check-list">${checklist}</ul>
    </div>
  </section>
  <section class="bwm-animal-section paper">
    <div class="bwm-animal-shell">
      <p class="bwm-animal-kicker">Common questions</p>
      <h2>${page.h1} FAQ</h2>
      <div class="bwm-faq-list">${faqs}</div>
    </div>
  </section>
  <section class="bwm-animal-final">
    <div class="bwm-animal-shell">
      <h2>Let’s identify what is happening at your property.</h2>
      <p>Tell ASAP what you are seeing or hearing, where it is happening, and the property address. The team can confirm service coverage and the next step.</p>
      <a class="bwm-animal-button" href="tel:${phoneHref}">Call ${phoneLabel}</a>
    </div>
  </section>
</main>
<!-- BWM_NEHEMIAH_ANIMAL_END -->`;
}

for (const page of pages) {
  const target = path.join(root, page.file);
  let html = fs.readFileSync(target, 'utf8');
  html = html.replace(/<!-- BWM_NEHEMIAH_ANIMAL_START -->[\s\S]*?<!-- BWM_NEHEMIAH_ANIMAL_END -->/g, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(/<meta content="[^"]*" name="viewport"\/><link rel="preload"/, `<meta content="width=device-width, initial-scale=1" name="viewport"/><link rel="stylesheet" href="/assets/css/nehemiah-animal-preview.css"/><link rel="preload"`);
  html = html.replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${escapeHtml(page.description)}"/>`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="${escapeHtml(page.description)}"/>`);
  html = html.replace(/<script type="application\/ld\+json">\{"@context": "https:\/\/schema.org", "@type": "FAQPage"[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  })}</script>`);
  html = html.replaceAll('7706913636', phoneHref).replaceAll('770-691-3636', '770-450-1744').replaceAll('770 - 691 - 3636', '770 - 450 - 1744').replaceAll('(770) 691-3636', phoneLabel);
  html = addFormLabels(html);
  const insertionPoint = html.indexOf('<section class="section-2">');
  if (insertionPoint < 0) throw new Error(`No animal-page insertion point in ${page.file}`);
  html = `${html.slice(0, insertionPoint)}${renderPage(page)}${html.slice(insertionPoint)}`;
  fs.writeFileSync(target, html);
}

console.log(`Built ${pages.length} Nehemiah animal-page candidates.`);
