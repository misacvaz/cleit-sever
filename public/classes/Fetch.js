class Fetch{




    static get(url, params = {}){

        return Fetch.request('GET', url, params )


    }

    static put(url, params = {}){

        return Fetch.request('PUT', url, params )


    }


    static post(url, params = {}){

        return Fetch.request('POST', url, params )


    }


    static delete(url, params = {}){

        return Fetch.request('DELETE', url, params )


    }


    /*static request(method, url, params = {}){

        return new Promise((resolve, reject)=>{

            let request;

            switch(method.toLowerCase()){

                case 'get':

                 request = url
                    break;
                    default:
                        request = new Request(url, {
                            method,
                            body: JSON.stringify(params),
                            headers: new Headers({
                                'Content-Type':'application/json'
                            })
                        });
            
            }


           
           
        fetch(request).then(response =>{

            response.json().then(json =>{

                resolve(json)
            }).catch(e =>{
                reject(e);
            });


            }).catch(e =>{
                reject(e);
            });


        });

    }*/

    static request(method, url, params = {}) {
        return new Promise((resolve, reject) => {
            let request;
    
            if (method.toLowerCase() === 'get') {
                request = url;
            } else {
                request = new Request(url, {
                    method,
                    body: JSON.stringify(params),
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                });
            }
    
            fetch(request).then(response => {
                if (!response.ok) {
                    reject(`Error: ${response.status} ${response.statusText}`);
                } else {
                    response.json().then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    }
    

     

        

       
}