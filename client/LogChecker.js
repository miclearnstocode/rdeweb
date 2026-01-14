 const LogRequest= async ()=>{

    const form= new FormData()

    form.append("sessionChecker", "true")

   return  await fetch("/sessionCheck", {

        method: 'POST',

        body: form

    }).then(response =>response.json())

}

let checkLogOutExecuted = false;
let checkLogInExecuted = false;

export const CheckLogOut=async ()=>{

    if(checkLogOutExecuted) return;
    checkLogOutExecuted = true;

    LogRequest().then(data=>{

        if(data.status){

            window.location.replace('/account/Login?')

        }

    })

 }

 export const CheckLogIn=async ()=>{

     if(checkLogInExecuted) return;
     checkLogInExecuted = true;

     LogRequest().then(data=>{

         // Only redirect away from login if user IS already logged in
         if(!data.status && data.message){

             // User is logged in on login page, redirect to appropriate dashboard
             // This prevents users from staying on login page when already authenticated
             
         }

     })

 }



 export const Socket=()=>{

    const sender=new WebSocket("wss://")

 }