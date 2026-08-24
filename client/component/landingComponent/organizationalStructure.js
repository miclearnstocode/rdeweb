import { $ } from '../../lib/lib.js';

const IMAGES = {
  board: 'https://placehold.co/80x80/1a2a3a/ffffff?text=BOR',
  secretary: 'https://placehold.co/80x80/2a4a6a/ffffff?text=SEC',
  linan: '/client/images/orgStruc/efrenLinan.png',
  biclar: '/client/images/orgStruc/leoAndrewBiclar.png',
  stephanie: '/client/images/orgStruc/stephaniePimentel.png',
  french: '/client/images/orgStruc/frenchDampog.png',
  jocelyn: '/client/images/orgStruc/jocelynLegaspi.png',
  emily: '/client/images/orgStruc/emelyEscala.png',
  marife: '/client/images/orgStruc/marifeHilapad.png',
  rey: '/client/images/orgStruc/reyDelaCalzada.png',
  roger: '/client/images/orgStruc/rogerBeragnio.png',
  monalyn: '/client/images/orgStruc/monalynOloroso.png',
  emmanuel: '/client/images/orgStruc/emmanuelDayalo.png',
  ramonita: '/client/images/orgStruc/ramonitaVerano.png',
  ivy: '/client/images/orgStruc/ivyBermio.png',
  nina: '/client/images/orgStruc/ninaObeja.png',
  princess: '/client/images/orgStruc/princessPalawan.png',
  rae: '/client/images/orgStruc/raenNorreinLedesma.png',
  ruel: '/client/images/orgStruc/ruelVerde.png',
  nicolas: '/client/images/orgStruc/nicolasBrana.png'
};

const PERSONNEL = [
  { id: 'board', label: 'BOARD OF REGENTS', title: 'Governing Board', image: IMAGES.board, x: 730, y: 20 },
  { id: 'secretary', label: 'BOARD SECRETARY', title: 'Board Secretary', image: IMAGES.secretary, x: 900, y: 20 },
  { id: 'linan', label: 'DR. EFREN L. LINAN', title: 'SUC President III', image: IMAGES.linan, x: 800, y: 150 },
  { id: 'biclar', label: 'DR. LEO ANDREW B. BICLAR', title: 'Vice President for RDE', image: IMAGES.biclar, x: 800, y: 260 },

  // Branch A: Research
  { id: 'stephanie', label: 'DR. STEPHANIE S. PIMENTEL', title: 'University Research Director', image: IMAGES.stephanie, x: 500, y: 380 },

  // Branch B: IPMO
  { id: 'french', label: 'MR. FRENCH A. DAMPOG', title: 'IPMO Director', image: IMAGES.french, x: 950, y: 380 },

  // Branch C: Extension
  { id: 'jocelyn', label: 'PROF. JOCELYN S. LEGASPI', title: 'University Extension Director', image: IMAGES.jocelyn, x: 1320, y: 380 },

  // Row 1 Research Directors
  { id: 'emily', label: 'DR. EMELY J. ESCALA', title: 'Director, LRDC', image: IMAGES.emily, x: 80, y: 590 },
  { id: 'marife', label: 'DR. MARIFE R. HILAPAD', title: 'Director, FITRDC', image: IMAGES.marife, x: 240, y: 590 },
  { id: 'rey', label: 'DR. REY DELA CALZADA', title: 'Director, FRDC', image: IMAGES.rey, x: 400, y: 590 },
  { id: 'roger', label: 'PROF. ROGER L. BERGANIO', title: 'Director, Coco RDC', image: IMAGES.roger, x: 560, y: 590 },
  { id: 'ramonita', label: 'DR. RAMONITA C. VERANO', title: 'Director, CSRDC', image: IMAGES.ramonita, x: 720, y: 590 },
  { id: 'monalyn', label: 'ENGR. MONALYN L. OLOROSO', title: 'Director, MATEC', image: IMAGES.monalyn, x: 880, y: 590 },
  { id: 'emmanuel', label: 'DR. EMMANUEL D. DAYALO', title: 'Director, SSRDC', image: IMAGES.emmanuel, x: 1040, y: 590 },

  // Row 2 Research URA's
  { id: 'ivy', label: 'IVY S. BERMIO', title: 'University Research Associate I', image: IMAGES.ivy, x: 280, y: 700 },
  { id: 'nina', label: 'ENGR. NINA L. OBEJA', title: 'University Research Associate II', image: IMAGES.nina, x: 500, y: 700 },
  { id: 'princess', label: 'PRINCESS P. PALAWAN', title: 'University Research Associate II', image: IMAGES.princess, x: 670, y: 700 },

  // Row 2 Extension URA's
  { id: 'rae', label: 'RAE NORREEN S. LEDESMA', title: 'University Research Associate II', image: IMAGES.rae, x: 1200, y: 700 },
  { id: 'ruel', label: 'MR. RUEL S. VERDE', title: 'Agricultural Technologist', image: IMAGES.ruel, x: 1320, y: 700 },
  { id: 'nicolas', label: 'ENGR. NICOLAS L. BRAÑA III', title: 'University Research Associate II', image: IMAGES.nicolas, x: 1440, y: 700 }
];

const TRAVEL_PATH = [
  'board', 'secretary', 'board', 'linan', 'biclar',
  'stephanie', 'emily', 'stephanie', 'marife', 'stephanie', 'rey', 'stephanie', 'roger', 'stephanie', 'monalyn', 'stephanie', 'emmanuel', 'stephanie', 'ramonita', 'stephanie', 'ivy', 'stephanie', 'nina', 'stephanie', 'princess', 'stephanie',
  'french',
  'jocelyn', 'rae', 'jocelyn', 'ruel', 'jocelyn', 'nicolas', 'jocelyn'
];

const CONNECTIONS_MAP = [
  { from: 'board', to: 'secretary' }, { from: 'board', to: 'linan' },
  { from: 'linan', to: 'biclar' },
  { from: 'biclar', to: 'stephanie' }, { from: 'biclar', to: 'french' }, { from: 'biclar', to: 'jocelyn' },
  { from: 'stephanie', to: 'emily' }, { from: 'stephanie', to: 'marife' }, { from: 'stephanie', to: 'rey' },
  { from: 'stephanie', to: 'roger' }, { from: 'stephanie', to: 'monalyn' }, { from: 'stephanie', to: 'emmanuel' },
  { from: 'stephanie', to: 'ramonita' }, { from: 'stephanie', to: 'ivy' }, { from: 'stephanie', to: 'nina' },
  { from: 'stephanie', to: 'princess' },
  { from: 'jocelyn', to: 'rae' }, { from: 'jocelyn', to: 'ruel' }, { from: 'jocelyn', to: 'nicolas' }
];

export const OrganizationalStructure = () => {
  let containerRef = null;
  let pathCache = {};
  let isVisible = true;
  let visitedRoots = {};
  let dotElement = null;
  let characterCardElement = null;
  let travelerInterval = null;

  const renderStructure = (el) => {
    containerRef = el;
    el.innerHTML = ''; 

    const vw = window.innerWidth;
    const isMobile = vw < 768;
    const scale = isMobile ? 0.4 : 1.0;
    
    const width = 1600;
    const height = 850; 

    const wrapper = $({
      tag: 'div',
      att: { id: 'org-structure-wrapper' },
      style: {
        position: 'relative',
        width: '100%',
        maxWidth: '1500px',
        margin: '0 auto',
        overflow: 'visible',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.3s ease'
      }
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.style.position = 'relative';
    svg.style.zIndex = '1';

    const generatePath = (x1, y1, x2, y2) => {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    };

    CONNECTIONS_MAP.forEach(conn => {
      const from = PERSONNEL.find(p => p.id === conn.from);
      const to = PERSONNEL.find(p => p.id === conn.to);
      if (from && to) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = generatePath(from.x + 35, from.y + 35, to.x + 35, to.y);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#cbd5e1');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('class', 'org-line');
        svg.appendChild(path);
        
        pathCache[`${conn.from}-${conn.to}`] = d;
      }
    });

    PERSONNEL.forEach((person) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `org-node ${person.id}`);

      const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
      foreignObject.setAttribute('x', person.x);
      foreignObject.setAttribute('y', person.y);
      foreignObject.setAttribute('width', '70');
      foreignObject.setAttribute('height', '70');
      
      const imgDiv = document.createElement('div');
      imgDiv.style.cssText = `
        width: 70px; height: 70px; border-radius: 18px;
        overflow: hidden;
        border: 4px solid #e2e8f0; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        background: #e0f2fe;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.4s ease;
      `;
      const img = document.createElement('img');
      img.src = person.image;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      imgDiv.appendChild(img);
      foreignObject.appendChild(imgDiv);

      const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      textGroup.setAttribute('transform', `translate(${person.x}, ${person.y + 80})`);

      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameText.setAttribute('x', '0');
      nameText.setAttribute('y', '0');
      nameText.setAttribute('text-anchor', 'middle');
      nameText.setAttribute('font-family', "'Inter', 'Segoe UI', sans-serif");
      nameText.setAttribute('font-size', '10');
      nameText.setAttribute('font-weight', '700');
      nameText.setAttribute('fill', '#1e293b');
      nameText.textContent = person.label;

      const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      titleText.setAttribute('x', '0');
      titleText.setAttribute('y', '12');
      titleText.setAttribute('text-anchor', 'middle');
      titleText.setAttribute('font-family', "'Inter', 'Segoe UI', sans-serif");
      titleText.setAttribute('font-size', '8');
      titleText.setAttribute('fill', '#475569');
      titleText.textContent = person.title;

      textGroup.appendChild(nameText);
      textGroup.appendChild(titleText);
      g.appendChild(foreignObject);
      g.appendChild(textGroup);
      svg.appendChild(g);
    });

    wrapper.appendChild(svg);

    dotElement = $({
      tag: 'div',
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '24px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: '#0ea5e9',
        boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)',
        transform: 'translate(-50%, -50%)',
        zIndex: '2',
        transition: 'none',
        opacity: '0'
      }
    });
    wrapper.appendChild(dotElement);

    characterCardElement = $({
      tag: 'div',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.8)',
        zIndex: '9999',
        backgroundColor: '#e0f2fe',
        borderRadius: '20px',
        padding: '32px 36px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(14, 165, 233, 0.15)',
        minWidth: '420px',
        textAlign: 'center',
        opacity: '0',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      },
      child: [
        $({
          tag: 'div',
          att: { id: 'traveler-image-container' },
          style: {
            width: '160px',
            height: '160px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '6px solid #0ea5e9',
            boxShadow: '0 6px 24px rgba(14, 165, 233, 0.25)',
            background: '#ffffff'
          },
          child: [
            $({
              tag: 'img',
              att: { id: 'traveler-image', src: IMAGES.board, alt: 'Traveler' },
              style: { width: '100%', height: '100%', objectFit: 'cover' }
            })
          ]
        }),
        $({
          tag: 'div',
          att: { id: 'traveler-name' },
          style: { 
            fontSize: '28px',
            fontWeight: '800', 
            color: '#1a2a3a', 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            marginTop: '6px'
          },
          text: 'BOARD OF REGENTS'
        }),
        $({
          tag: 'div',
          att: { id: 'traveler-position' },
          style: { 
            fontSize: '18px',
            color: '#475569', 
            fontFamily: '"Inter", sans-serif',
            fontWeight: '500' 
          },
          text: 'Governing Board'
        })
      ]
    });
    document.body.appendChild(characterCardElement);

    el.appendChild(wrapper);

    // Fix: Use the dotElement variable properly
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible = true;
        } else {
          isVisible = false;
          if (characterCardElement) {
            characterCardElement.style.opacity = '0';
            characterCardElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
          }
          if (dotElement) {
            dotElement.style.opacity = '0';
          }
        }
      });
    }, { threshold: 0.1 });
    observer.observe(el);

    // Clear any existing interval
    if (travelerInterval) {
      clearTimeout(travelerInterval);
      travelerInterval = null;
    }

    setTimeout(() => {
      startTravelLoop(wrapper, dotElement, characterCardElement);
    }, 500);
  };

  const startTravelLoop = (container, dot, card) => {
    let pathIndex = 0;

    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const traversePath = (fromId, toId, callback) => {
      const key = `${fromId}-${toId}`;
      const d = pathCache[key];
      
      if (!d) return callback();

      const svg = container.querySelector('svg');
      if (!svg) return callback();
      
      const svgRect = svg.getBoundingClientRect();

      tempPath.setAttribute('d', d);
      
      const pathLength = tempPath.getTotalLength();
      const steps = 40;
      let currentStep = 0;

      const moveStep = () => {
        const t = currentStep / steps;
        const point = tempPath.getPointAtLength(t * pathLength);
        
        const scaleX = svgRect.width / 1600;
        const scaleY = svgRect.height / 850;

        const screenX = svgRect.left + (point.x * scaleX);
        const screenY = svgRect.top + (point.y * scaleY);

        const wrapperRect = container.getBoundingClientRect();
        const finalX = screenX - wrapperRect.left;
        const finalY = screenY - wrapperRect.top;

        if (dot) {
          dot.style.left = `${finalX}px`;
          dot.style.top = `${finalY}px`;
        }

        currentStep++;
        if (currentStep <= steps) {
          requestAnimationFrame(moveStep);
        } else {
          callback();
        }
      };
      moveStep();
    };

    const moveToNext = () => {
      if (!isVisible) {
        travelerInterval = setTimeout(moveToNext, 1000);
        return;
      }

      if (pathIndex >= TRAVEL_PATH.length) {
        pathIndex = 0;
        visitedRoots = {};
      }

      const targetId = TRAVEL_PATH[pathIndex];
      const targetNode = PERSONNEL.find(p => p.id === targetId);
      
      if (targetNode && dot && card) {
        const onceRoots = ['board', 'secretary', 'linan', 'biclar', 'french', 'jocelyn', 'stephanie'];
        const shouldShowCard = !(onceRoots.includes(targetId) && visitedRoots[targetId]);

        const nextIndex = (pathIndex + 1) % TRAVEL_PATH.length;
        const nextId = TRAVEL_PATH[nextIndex];

        if (shouldShowCard) {
          const img = card.querySelector('#traveler-image');
          const name = card.querySelector('#traveler-name');
          const pos = card.querySelector('#traveler-position');
          if(img) img.src = targetNode.image;
          if(name) name.textContent = targetNode.label;
          if(pos) pos.textContent = targetNode.title;

          card.style.opacity = '1';
          card.style.transform = 'translate(-50%, -50%) scale(1)';
          dot.style.opacity = '0';

          if (onceRoots.includes(targetId)) {
            visitedRoots[targetId] = true;
          }
        } else {
          card.style.opacity = '0';
          dot.style.opacity = '1';
        }

        travelerInterval = setTimeout(() => {
          if (shouldShowCard) {
            card.style.opacity = '0';
            card.style.transform = 'translate(-50%, -50%) scale(0.8)';
          }
          dot.style.opacity = '1';

          traversePath(targetId, nextId, () => {
            pathIndex = nextIndex;
            travelerInterval = setTimeout(moveToNext, 400);
          });
        }, shouldShowCard ? 2500 : 1200);
      }
    };

    moveToNext();
  };

  return $({
    tag: 'section',
    att: { id: 'organizational-structure' },
    style: {
      padding: '80px 20px 40px 20px',
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    },
    child: [
      $({
        tag: 'div',
        style: {
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.03) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }),
      $({
        tag: 'div',
        att: { className: 'container' },
        style: { position: 'relative', zIndex: 1 },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            style: { textAlign: 'center', marginBottom: '40px' },
            child: [
              $({ 
                tag: 'h2', 
                text: 'RDE Organizational Structure', 
                att: { className: 'section-title' },
                style: { 
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '2.2rem', 
                  fontWeight: '700', 
                  color: '#1a2a3a',
                  marginBottom: '8px'
                }
              }),
              $({ 
                tag: 'p', 
                text: 'Watch the leadership drive CAPSU forward.',
                style: { 
                  fontFamily: '"Inter", sans-serif',
                  color: '#64748b', 
                  fontSize: '1.05rem',
                  maxWidth: '600px',
                  margin: '0 auto'
                }
              })
            ]
          }),
          $({
            tag: 'div',
            style: { 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px'
            },
            elementHandler: renderStructure
          })
        ]
      })
    ]
  });
};