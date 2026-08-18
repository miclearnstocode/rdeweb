import { $ } from '../../lib/lib.js';
import { fetchEvents, eventCard } from './fetchEvents.js';

export const UpcomingEvents = () => {
    let container;

    const loadEvents = async (el) => {
        container = el;
        const data = await fetchEvents('Upcoming');

        if (data.length === 0) {
            container.appendChild($({
                tag: 'div',
                style: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
                text: 'No upcoming events scheduled at the moment.'
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
        style: { padding: '80px 0', backgroundColor: 'var(--white)' },
        child: [
            $({
                tag: 'div',
                att: { className: 'container' },
                child: [
                    $({
                        tag: 'div',
                        att: { className: 'section-header' },
                        child: [
                            $({ tag: 'h2', text: 'Mark Your Calendar', att: { className: 'section-title' } }),
                            $({ tag: 'p', text: 'Upcoming events and conferences', style: { color: 'var(--text-gray)', marginTop: '15px' } })
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