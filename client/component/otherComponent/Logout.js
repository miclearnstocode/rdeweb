import {$} from '../../lib/lib.js'

export const Logout=()=>{
    return($({
        tag:'div',
        att:{
            className:'logoutDiv'
        },
        text:'Log-out',
        event:{
            type:'click',
            method:async ()=>{
                sessionStorage.clear()
                const form=new FormData();
                form.append('logout','true')
                await fetch('/logout',{
                    method:'POST',
                    body:form
                }).then(res=>res.text())
                    .then(data=>{
                        window.location.replace(data)
                    })
            }
        }
    }))
}
