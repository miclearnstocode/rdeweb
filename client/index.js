import {$} from './lib/lib.js'

import {LoginPage} from "./component/login.js";

import {AdminPanel} from "./component/admin.js";

import {UserPanel} from "./component/user.js";

import {Error as ErrorPage} from "./error.js";

import {Evaluator} from "./component/evaluator.js";

import {RdeOffice} from "./component/rdeStaff/script/rde.js";

import {Scanner} from "./component/scanner.js";

import {DocumentViewer} from "./component/otherComponent/Document.js";

import {Retrieval} from "./AccountRetrival/retrival.js";



// DEBUG: Log ALL fetch requests
(function() {
    const originalFetch = window.fetch;
    let requestCount = 0;
    
    window.fetch = function(...args) {
        const requestId = ++requestCount;
        const [url, options = {}] = args;
        
        //console.group(`FETCH #${requestId}: ${options.method || 'GET'} ${url}`);
        //console.log('Options:', options);
        //console.log('Time:', new Date().toLocaleTimeString());
        //console.groupEnd();
        
        const startTime = Date.now();
        
        return originalFetch.apply(this, args)
            .then(response => {
                const duration = Date.now() - startTime;
                
                // Clone to check content without consuming
                const clone = response.clone();
                const contentType = clone.headers.get('content-type') || '';
                
                //console.group(`RESPONSE #${requestId}: ${response.status} ${url}`);
                //console.log('Status:', response.status, response.statusText);
                //console.log('Content-Type:', contentType);
                //console.log('Duration:', duration + 'ms');
                //console.log('URL:', response.url);
                
                // Check if it's JSON or HTML
                clone.text().then(text => {
                    //console.log('First 100 chars:', text.substring(0, 100));
                    
                    if (!contentType.includes('application/json')) {
                        //console.warn('⚠️ WARNING: Not JSON! Is HTML?', text.startsWith('<!DOCTYPE') || text.startsWith('<html'));
                    }
                }).catch(e => console.log('Could not read response text:', e));
                
                //console.groupEnd();
                return response;
            })
            .catch(error => {
                //console.error(`❌ FETCH ERROR #${requestId}:`, error);
                throw error;
            });
    };
})();

const Login = () => {

    return ($({

        tag: 'div',

        child: [



            LoginPage(),

        ]

    }))

}



const Admin = () => {

    return ($({

        tag: 'div',

        child: [

            AdminPanel(),

        ]

    }))

}



const User = () => {

    return ($({

        tag: 'div',

        child: [

            UserPanel(),

        ]

    }))

}



const Docs = () => {
    return ($({

        tag: 'div',

        text: 'hello this is docs'

    }))

}







const url = window.location.href.replace(window.location.origin, '')

let Render

(function (a, b) {

    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))

    {

        document.body.innerHTML=''

        alert("The system currently unavailable for mobile devices...")

    }

})(navigator.userAgent || navigator.vendor || window.opera, 'http://detectmobilebrowser.com/mobile');







window.addEventListener('DOMContentLoaded', () => {

    (function (url) {

        if (url.split('/')[1] === 'account') {

            document.body.appendChild($({

                tag: 'div',

                att: {

                    id: 'particles-js'

                },

                style: {

                    height: '99%',

                    width: '100%',

                    position: 'absolute',

                    zIndex: '-1',

                }

            }))

            document.body.appendChild($({

                tag: 'script',

                att: {

                    src: '/particle/particles.js'

                }

            }))

            setTimeout(()=>{

                document.body.appendChild($({

                    tag: 'script',

                    att: {

                        src: '/particle/app.js'

                    }

                }))

            },100)

            Render = Login

            document.getElementById('root').appendChild(Render())

        } else if (url.split('/')[1] === 'view') {

            Render = DocumentViewer

            document.getElementById('root').appendChild(Render())

        } else if (url.split('/')[1] === 'accountSupport'){

            Render=Retrieval

            document.getElementById('root').appendChild(Render())

        }

        else {

            // Session check DISABLED - causes recursive redirects
            // Trust server session management instead of checking on every page load
            // Just render the appropriate component based on URL
            
            if (url.split('/')[1] === 'admin') {
                Render = Admin
            } else if (url.split('/')[1] === 'user') {
                Render = User
            } else if (url.split('/')[1] === 'evaluator') {
                Render = Evaluator
            } else if (url.split('/')[1] === 'rdeOffice') {
                Render = RdeOffice
            } else if (url.split('/')[1] === 'researcher') {
                Render = Evaluator
            } else if (url.split('/')[1] === 'external') {
                Render = RdeOffice
            } else {
                Render = ErrorPage
            }
            
            document.getElementById('root').appendChild(Render())

        }

    })(window.location.href.replace(window.location.origin, ''))



})

