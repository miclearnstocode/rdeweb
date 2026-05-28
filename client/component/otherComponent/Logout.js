import {$} from '../../lib/lib.js'

export const Logout = () => {
    return($({
        tag:'div',
        att:{
            className:'logoutDiv'
        },
        html: '<i class="fas fa-sign-out-alt"></i> Log-out',
        event:{
            type:'click',
            method:async ()=>{
                // Clear all storage
                sessionStorage.clear();
                localStorage.clear();
                
                // Reset session flags
                window.checkLogOutExecuted = false;
                window.checkLogInExecuted = false;
                
                const form=new FormData();
                form.append('logout','true')
                
                try {
                    const res = await fetch('/logout',{
                        method:'POST',
                        body:form
                    });
                    const data = await res.text();
                    window.location.replace(data);
                } catch(error) {
                    console.error('Logout error:', error);
                    // Force redirect to login even if logout request fails
                    window.location.replace('/account/Login?');
                }
            }
        }
    }))
}