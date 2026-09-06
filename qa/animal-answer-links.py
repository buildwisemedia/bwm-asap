#!/usr/bin/env python3
"""Offline content/graph acceptance for the five animal-page answer surfaces."""
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = ['rodent-removal', 'wildlife/mouse-rat', 'wildlife/gray-squirrel', 'wildlife/raccoon', 'wildlife/bats']


def validate(html, route):
    doc = BeautifulSoup(html, 'html.parser')
    canonical = doc.select_one('link[rel=canonical]')['href']
    assert canonical == f'https://removeasap.com/{route}/', 'canonical route changed'
    graph = json.loads(doc.select_one('script[type="application/ld+json"]').string)['@graph']
    node = {n['@type']: n for n in graph if isinstance(n['@type'], str)}
    webpage, service, faq, crumb = [node[t] for t in ['WebPage', 'Service', 'FAQPage', 'BreadcrumbList']]
    assert webpage['url'] == canonical and service['url'] == canonical
    assert webpage['mainEntity']['@id'] == service['@id']
    assert service['mainEntityOfPage']['@id'] == webpage['@id']
    assert webpage['breadcrumb']['@id'] == crumb['@id']
    assert webpage['hasPart']['@id'] == faq['@id']
    assert faq['isPartOf']['@id'] == webpage['@id']
    assert faq['about']['@id'] == service['@id']
    assert webpage['description'] == doc.select_one('meta[name=description]')['content']
    if route == 'rodent-removal':
        assert doc.select_one('#bait-station-title').get_text() == 'Recurring Rodent Bait Stations', 'August26 client heading request'
    ids = [n['id'] for n in doc.select('[id]')]
    assert len(ids) == len(set(ids)), 'duplicate HTML fragment ID'
    details = doc.select('.faq-list details')
    assert len(details) == len(faq['mainEntity']) and len(details) >= 4
    for item, question in zip(details, faq['mainEntity']):
        summary, answer = item.select_one('summary'), item.select_one('p')
        assert summary.get_text() == question['name'], 'schema question differs from visible question'
        assert answer.get_text() == question['acceptedAnswer']['text'], 'schema answer differs from visible answer'
        assert question['@id'] == canonical + '#' + summary['id']
        assert question['url'] == question['acceptedAnswer']['@id'] == canonical + '#' + answer['id']
        assert re.fullmatch(r'answer-[a-z0-9-]+', answer['id'])
    return len(details)


if __name__ == '__main__':
    pages = []
    for route in PAGES:
        html = (ROOT / route / 'index.html').read_text()
        pages.append({'route': route, 'answers': validate(html, route)})
    # Prove that the acceptance catches stale structured answers, wrong-page
    # canonicals, and duplicate anchors rather than checking only JSON syntax.
    html = (ROOT / PAGES[0] / 'index.html').read_text()
    rejected = []
    for mutation in ['stale-answer', 'wrong-canonical', 'duplicate-anchor']:
        doc = BeautifulSoup(html, 'html.parser')
        if mutation == 'stale-answer':
            script = doc.select_one('script[type="application/ld+json"]')
            data = json.loads(script.string)
            next(n for n in data['@graph'] if n['@type'] == 'FAQPage')['mainEntity'][0]['acceptedAnswer']['text'] = 'Unsupported replacement answer'
            script.string = json.dumps(data)
        elif mutation == 'wrong-canonical':
            doc.select_one('link[rel=canonical]')['href'] = 'https://removeasap.com/wildlife/bats/'
        else:
            answers = doc.select('.faq-list details p')
            answers[1]['id'] = answers[0]['id']
        try:
            validate(str(doc), PAGES[0])
        except AssertionError:
            rejected.append(mutation)
        else:
            raise AssertionError(f'Failed to reject {mutation}')
    print(json.dumps({'ok': True, 'pages': pages, 'total_answers': sum(p['answers'] for p in pages), 'negative_cases_rejected': rejected}, indent=2))
