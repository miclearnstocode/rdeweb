import {$} from '../../../lib/lib.js'

export const Button = ({icon, label, eventHandler}) => {
    const children = [];
    
    if(icon){
        children.push($({
            tag: 'i',
            att: {
                className: `${icon.text} ${icon.class || ''}`.trim(),
            },
            style: {
                fontSize: '1.3rem',
                width: '32px',
                textAlign: 'center'
            }
        }));
    }
    
    if(label){
        children.push($({
            tag: 'span',
            att: {
                className: label.class || ''
            },
            style: {
                fontFamily: 'Inter, Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                fontSize: '0.9rem',
                fontWeight: '500',
                flex: '1',
                textAlign: 'left',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: '1.4'
            },
            text: label.text
        }));
    }

    return($({
        tag: 'div',
        att: {
            className: 'modern-nav-btn'
        },
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: '#475569'
        },
        event: {
            type: 'click',
            method: (e) => {
                const allButtons = document.querySelectorAll('.modern-nav-btn');
                allButtons.forEach(btn => {
                    btn.classList.remove('active-nav');
                });
                
                e.currentTarget.classList.add('active-nav');
                
                if(eventHandler) {
                    eventHandler(e);
                }
            },
            type2: 'mouseenter',
            method2: (e) => {
                if (!e.currentTarget.classList.contains('active-nav')) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.transform = 'translateX(4px)';
                }
            },
            type3: 'mouseleave',
            method3: (e) => {
                if (!e.currentTarget.classList.contains('active-nav')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                }
            }
        },
        child: children
    }))
}

export const NavBar = (props) => {
    return ($({
        tag: 'div',
        externalStyle: '/client/component/userComponent/userComponentStyle/navBar.css',
        elementHandler: props.getNav,
        att: {
            className: 'navBar modern-nav-bar'
        },
        child: []
    }))
}