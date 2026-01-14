const LogRequest= async ()=>{

    const form= new FormData()

    form.append("sessionChecker", "true")

   return  await fetch("/sessionCheck", {

        method: 'POST',

        body: form

    }).then(response =>response.json())

}

// Global flags for logout detection only
if(typeof window.checkLogOutExecuted === 'undefined') {
    window.checkLogOutExecuted = false;
}

// CheckLogOut is called by Logout button only - when user manually logs out
export const CheckLogOut=async ()=>{

    if(window.checkLogOutExecuted) return;
    window.checkLogOutExecuted = true;

    try {
        const data = await LogRequest();
        // After logout request is sent, redirect to login
        // Server will have destroyed the session
        window.location.replace('/account/Login?')
    } catch(error) {
        console.error('CheckLogOut error:', error);
        // Force redirect to login even if request fails
        window.location.replace('/account/Login?')
    }

 }

 export const Socket=()=>{

    const sender=new WebSocket("wss://")

 }
