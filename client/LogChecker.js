const LogRequest= async ()=>{
    const form= new FormData()
    form.append("sessionChecker", "true")
   return  await fetch("/sessionCheck", {
        method: 'POST',
        body: form
    }).then(response =>response.json())
}

if(typeof window.checkLogOutExecuted === 'undefined') {
    window.checkLogOutExecuted = false;
}

export const CheckLogOut=async ()=>{

    if(window.checkLogOutExecuted) return;
    window.checkLogOutExecuted = true;

    try {
        const data = await LogRequest();
        window.location.replace('/account/Login?')
    } catch(error) {
        console.error('CheckLogOut error:', error);
        window.location.replace('/account/Login?')
    }

 }

 export const Socket=()=>{
    const sender=new WebSocket("wss://")
 }

export const socket = newWebSocket("ws://localhost:8000");
socket.onopen = function(event) {
    console.log("WebSocket is open now.");
}
