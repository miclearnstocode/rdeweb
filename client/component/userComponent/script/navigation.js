import {$} from '../../../lib/lib.js'

export const Button=({icon,label,eventHandler})=>{
    const children = [];
    
    if(icon){
        children.push($({
            tag: 'i',
            att: {
                className: `${icon.text} ${icon.class || ''}`.trim(),
            },
            style: {
                fontSize: '1.5rem',
                width: '36px',
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
                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                fontSize: '1rem',
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
            gap: '1rem',
            padding: '0.8rem 1.2rem',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            border: 'none',
            background: 'transparent'
        },
        event: {
            type: 'click',
            method: (e) => {
                // Remove active class from all buttons
                const allButtons = document.querySelectorAll('.modern-nav-btn');
                allButtons.forEach(btn => {
                    btn.classList.remove('active-nav');
                });
                
                // Add active class to clicked button
                e.currentTarget.classList.add('active-nav');
                
                // Call the original event handler
                if(eventHandler) {
                    eventHandler(e);
                }
            }
        },
        child: children
    }))
}

export const NavBar=(props)=>{
    return ($({
        tag:'div',
        externalStyle:'/client/component/userComponent/userComponentStyle/navBar.css',
        elementHandler:props.getNav,
        att:{
            className:'navBar'
        },
        child:[]
    }))
}