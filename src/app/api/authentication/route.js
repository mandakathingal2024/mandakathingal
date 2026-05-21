'use server'
import { serialize } from 'cookie'

export async function POST(request) {
    const  req  = await request.json()
    // console.log(req);

    // const res= new Response()
    // res.setHeader('Set-Cookie', cookie)
    // res.status(200).json({ message: 'Successfully set cookie!' })

    const userName=process.env.USER_NAME;
    const password=process.env.PASSWORD;
    if(userName===req.userName && password===req.password){
        // console.log('Authentication Success');
        const data={isAuthenticated:true}
        const res=JSON.stringify(data);
        const sessionData = req
        // const encryptedSessionData = encrypt(sessionData)
       
        const cookie = serialize('session', sessionData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // One week
          path: '/',
        })

        const headers = {"set-cookie":cookie}
          const myHeaders = new Headers(headers);
        
        const response=new Response(res,{status:200,headers:myHeaders})
        // console.log(response);
        return response
    }
    else{
        // console.log('Authentication Success');
        const data={isAuthenticated:false}
        const res=JSON.stringify(data);
        return new Response(res,{status:200})
    }
}