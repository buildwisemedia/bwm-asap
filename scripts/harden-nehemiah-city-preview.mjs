import fs from 'node:fs';
import path from 'node:path';

const pages = ['acworth', 'canton', 'cartersville', 'kennesaw', 'woodstock'];
const root = process.cwd();

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

for (const city of pages) {
  const target = path.join(root, `wildlife-removal-${city}`, 'index.html');
  let html = fs.readFileSync(target, 'utf8');

  html = html
    .replace(/\sdata-wf-intellimize-customer-id="[^"]*"/, '')
    .replace(/<style>\.anti-flicker,[\s\S]*?<\/style>/, '')
    .replace(/<style>\[data-wf-hidden-variation\][\s\S]*?<\/style>/, '')
    .replace(/<script type="text\/javascript">localStorage\.removeItem\('intellimize_opt_out_[\s\S]*?<\/script>/, '')
    .replace(/<script type="text\/javascript">\(function\(e,t,p\)[\s\S]*?<\/script>/, '')
    .replace(/<link href="https:\/\/cdn\.intellimize\.co\/snippet\/[^"]+" rel="preload" as="script"\/>/, '')
    .replace(/<script type="text\/javascript">var wfClientScript=[\s\S]*?<\/script>/, '')
    .replace(/<link href="https:\/\/api\.intellimize\.co"[^>]*\/>/, '')
    .replace(/<link href="https:\/\/log\.intellimize\.co"[^>]*\/>/, '')
    .replace(/<link href="https:\/\/[^\"]+\.intellimizeio\.com"[^>]*\/>/, '')
    .replace(/<script>\(function\(w,i,g\)[\s\S]*?google_tags_first_party[\s\S]*?<\/script>/, '')
    .replace(/<script async="" src="\/g0lnomhfn3mgNjFhNjhjM2FjMmJiZGM5ZjRjMzU2ZDU1\/[^"]+"><\/script>/, '')
    .replace(/<script type="text\/javascript">window\.dataLayer = window\.dataLayer[\s\S]*?anonymize_ip[\s\S]*?<\/script>/, '')
    .replace(/<!-- Reddit Pixel -->[\s\S]*?<!-- End Reddit Pixel -->/, '')
    .replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/, '')
    .replace(/<script src="https:\/\/cdn\.prod\.website-files\.com\/61a68c3ac2bbdc9f4c356d55%2F[^"]+clarity_script[^"]+"[^>]*><\/script>/, '')
    .replace(/<link href="https:\/\/cdn\.prod\.website-files\.com\/61a68c3ac2bbdc9f4c356d55\/css\/asap-wildlife-removal\.webflow\.shared\.[^"]+\.css" rel="stylesheet" type="text\/css"[^>]*\/>/, '<link href="/assets/css/webflow.shared.css" rel="stylesheet"/>')
    .replaceAll('https://cdn.prod.website-files.com/61a6f04dba9e11e400c344e8/6620d2d18b046ab77d31c87a_6620be784ae1214dd3d44768_squirrel.png', '/assets/images/animals/squirrel-optimized.webp')
    .replaceAll('https://cdn.prod.website-files.com/61a6f04dba9e11e400c344e8/61d90636b70812fdd9c9a4d4_raccoon.png', '/assets/images/wildlife-grid/raccoon.webp')
    .replaceAll('https://cdn.prod.website-files.com/61a6f04dba9e11e400c344e8/61d9dea30bdf291ad27ebe4a_bat-new.png', '/assets/images/wildlife-grid/bat.webp')
    .replaceAll('https://cdn.prod.website-files.com/61a6f04dba9e11e400c344e8/61d9069b16eeed73079abd49_mouse.png', '/assets/images/wildlife-grid/mouse-rat.png')
    .replaceAll('info@wildliferemovalasap.com', 'info@removeasap.com')
    .replace('We use humane removal or trapping for the animal we confirm. We do not use poisons.', 'We choose a removal approach for the animal, access conditions, and evidence we confirm.')
    .replace('We use humane traps and methods that fit the animal and the space.', 'We choose a removal approach that fits the animal, the space, and applicable requirements.')
    .replace('We choose humane removal or trapping and never use poison for the job.', 'We choose the removal approach after confirming the animal, location, and property conditions.')
    .replace('We use humane trapping or removal based on the animal and the season.', 'We choose the removal approach based on the animal, the season, and the property conditions.')
    .replace('We remove or trap the animal with humane methods and no poisons.', 'We choose the removal approach after confirming the animal, access point, and current conditions.')
    .replace(
      'Our team is licensed by the GA DNR and the GA Department of Agriculture. We use humane methods. We do not use poisons.',
      'Our team uses humane methods and builds the plan around the animal, the property, and applicable Georgia requirements. We do not promise one removal method before inspection.'
    );

  if (!html.includes('/assets/css/nehemiah-city-preview.css')) {
    html = html.replace('</head>', '<link href="/assets/css/nehemiah-city-preview.css" rel="stylesheet"/></head>');
  }

  if (!html.includes('/assets/js/dev-preview-guard.js')) {
    html = html.replace('</body>', '<script defer src="/assets/js/dev-preview-guard.js"></script></body>');
  }

  html = html.replace(/<script src="(https:\/\/[^\"]+(?:jquery|webflow)[^\"]+)"/g, '<script defer src="$1"');
  html = addFormLabels(html);

  fs.writeFileSync(target, html);
}

console.log(`Hardened ${pages.length} Nehemiah city-page candidates.`);
