import { $ } from '../../lib/lib.js';
import { fetchEvents, eventCard } from './fetchEvents.js';

export const HappeningEvents = () => {
    let container;

    const loadEvents = async (el) => {
        container = el;
        const data = await fetchEvents('Ongoing');
        
        if (data.length === 0) {
            container.appendChild($({
                tag: 'div',
                style: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
                text: 'No ongoing events at the moment. Check back soon!'
            }));
            return;
        }

        const grid = $({
            tag: 'div',
            style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' },
            child: data.map(eventCard)
        });
        container.appendChild(grid);
    };

    return $({
        tag: 'section',
        att: { id: 'events' },
        style: { padding: '80px 0', backgroundColor: 'var(--light-bg)' },
        child: [
            $({
                tag: 'div',
                att: { className: 'container' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'section-header' },
                        child: [
                            $({ tag: 'h2', text: 'Happening Now', att: { className: 'section-title' } }),
                            $({ tag: 'p', text: 'Current activities and events hosted by the RDE Office', style: { color: 'var(--text-gray)', marginTop: '15px' } })
                        ]
                    }),
                    $({
                        tag: 'div',
                        elementHandler: loadEvents
                    })
                ]
            })
        ]
    });
};