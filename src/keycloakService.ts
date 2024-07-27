import * as https from 'https';
import { Injectable,Logger  } from "@nestjs/common";
import axios, { AxiosInstance } from 'axios';
import { response } from "express";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KeycloaskService{

    private keycloakUrl ='http://localhost:8080';
    private realm='SmartParking';
    private clientId='nestjs-app';
    private readonly logger = new Logger(KeycloaskService.name);

    private readonly axios: AxiosInstance;

    constructor() {
        // Create a new HTTPS agent with the specified certificate
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Create a new Axios instance with the custom agent
        this.axios = axios.create({
            httpsAgent: agent
        });
    }

    async createUser(email:string,password:string):Promise<string>{
        const token = await this.getAdminToken();
        
        try {

            const isEmail = email.includes('@');
            const username = isEmail ? email:`${email}`




            console.log('Creating user this user name :', username);
            const response = await this.axios.post(
              "https://16.171.20.170:8082/admin/realms/SmartParking/users",
              {
                enabled: true,
                username: username,
                email: isEmail? email : `user_${uuidv4()}@example.com`,
                credentials: [{ type: 'password', value: password, temporary: false }],
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );


            console.log('Created user:', response.data);


            const userId = isEmail ? await this.getUserIdByEmail(email):
            await this.getUserIdByUsername(username);



            return userId;
          } catch (error) {
            console.error('Error creating user in Keycloak:', error.response?.data || error.message);
            throw error;
          }
        }

        async getUserIdByUsername(username: string): Promise<string> {
            const token = await this.getAdminToken();
            try {
              const response = await  this.axios.get(
                `https://16.171.20.170:8082/admin/realms/SmartParking/users?username=${encodeURIComponent(username)}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              
              if (response.data && response.data.length > 0) {
                console.log('Found user ID:', response.data[0].id);
                return response.data[0].id;
              }
              throw new Error('User not found');
            } catch (error) {
              this.logger.error('Get user by username error:', error.response?.data || error.message);
              throw new Error('Failed to get user by username: ' + (error.response?.data?.error_description || error.message));
            }
          }
          
     generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }


    async getUserIdByEmail(email: string): Promise<string> {
        const token = await this.getAdminToken();
        try {
            const response = await  this.axios.get(
                `https://16.171.20.170:8082/admin/realms/SmartParking/users?email=${encodeURIComponent(email)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
                
            );
            
            if (response.data && response.data.length > 0) {
                console.log('Found user ID:', response.data[0].id);
                const keycloakId=response.data[0].id;
                return keycloakId;
            }
            throw new Error('User not found');
        } catch (error) {
            this.logger.error('Logout error:', error.response?.data || error.message);
            throw new Error('Logout failed: ' + (error.response?.data?.error_description || error.message));
        }
    }


    private async getAdminToken():Promise<string>{

      try{  const response = await  this.axios.post(
            "https://16.171.20.170:8082/realms/SmartParking/protocol/openid-connect/token",
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: 'nestjs-app',
                client_secret:'hcgnqQxNTHN3ALkAeZnWyZ3xMdTyqZ85'
            }),
            {
                headers:{'Content-Type':'application/x-www-form-urlencoded'}
            }
        );
        console.log('response data', response.data);

        
        return response.data.access_token;
    }
        catch(error){
            console.log(error)
        
    }


}

 async sendSmsOtp(phoneNumber: string, otp: string): Promise<void> {
    try {
      const response = await  this.axios.put(
        `Http://197.230.127.32:29590/SMSGatewayServicesNB/resources/smsgateway/sendmessage/sms/11111111111111/`,
        {
            "headerRequest": {
              "reqUID": "4654465465465465465464654",
              "sessionTokenID": "78787878787887887878788887",
              "userName": "saad.errarhiche",
              "secretCodeTrx": "44775588996622331100",
              "timeStamp": "timeStamp",
              "gpsLocation": "3.55669999",
              "deviceInfo": {
                "userAgent": "mkmlkmsqdpsqodj",
                "deviceBrand": "Samsung 2019",
                "deviceModel": "Galaxy S10",
                "deviceAppVersion": "1.234568",
                "deviceSignature": "465465465456465"
              }
            },
            "smsMessage": {
              "smsMessage": `code confirmation : ${otp}`,
              "msisdnDestination": phoneNumber
            }
          },{
            headers:{'msisdnDest':phoneNumber}
        }
      );
      console.log('OTP sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending OTP:', error.response?.data || error.message);
    }
  }


 async login(email:string,password:string):Promise<{access_token:string;refresh_token:string}>{

    try{
        this.logger.debug(`Attempting login for user: ${email}`)
      const response= await  this.axios.post(
        'https://16.171.20.170:8082/realms/SmartParking/protocol/openid-connect/token',
      
      new URLSearchParams({
        grant_type: 'password',
          client_id: 'nestjs-app',
          client_secret: 'Biw3kExVFU83zCyQLmbJ6kDGtfy0rONc',
          username: email,
          password: password,
      }),
      {
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
      }
    );

    this.logger.debug('Keycloak response:', response.data);

   if (!response.data.access_token || !response.data.refresh_token) {
      throw new Error('Invalid response from authentication server');
    }

    return{
        access_token:response.data.access_token,
        refresh_token:response.data.refresh_token,
    };
}catch(error){
    console.error('Login error:', error.response?.data || error.message);
    throw new Error('Login failed' + (error.response?.data?.error_description || error.message));
}
}

async verifyToken(token:string):Promise<boolean>{
    try{
        const response = await  this.axios.post('https://16.171.20.170:8082/realms/SmartParking/protocol/openid-connect/token/introspect',
            new URLSearchParams({
                client_id: 'nestjs-app',
                client_secret: 'Biw3kExVFU83zCyQLmbJ6kDGtfy0rONc',
                token: token
              }),
              {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
              }  

        );
        return response.data.active===true;
    }catch(error){
        this.logger.error('Token verification error:', error.response?.data || error.message);
    return false;
    }
}

async logout(refreshToken:string):Promise<void>{

    const isValid = await this.verifyToken(refreshToken);
    if(!isValid){
        throw new Error('Invalid or expired refresh token')
    }
try{
    this.logger.debug('Attemping to logout user');
    const response = await  this.axios.post('https://16.171.20.170:8082/realms/SmartParking/protocol/openid-connect/logout',
        new URLSearchParams(
            {
                client_id: 'nestjs-app',
                client_secret: 'Biw3kExVFU83zCyQLmbJ6kDGtfy0rONc',
                refresh_token: refreshToken

            }
        ),
        {
            headers:{
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

    );
    this.logger.debug('Logout response:', response.data);
    this.logger.debug('User logged out successfully');
    
}catch(error){
    this.logger.error('Logout error:', error.response?.data || error.message);
            throw new Error('Logout failed: ' + (error.response?.data?.error_description || error.message));
}

}


  async verifyPhoneNumber(userId: string, otp: string): Promise<boolean> {
        const token = await this.getAdminToken();

        try {
            const user = await this.getUserById(userId);
            console.log('User data for verification:', user);


            if (!user || !user.attributes || !user.attributes.otpcode) {
                this.logger.error('User, user attributes, or phoneVerificationCode not found');
                return false;
              }


            if (user.attributes.otpcode[0] === otp) {
                // Enable the user and remove the verification code
                await  this.axios.put(
                    `https://16.171.20.170:8082/admin/realms/SmartParking/users/${userId}`,
                    {
                        enabled: true,
                        attributes: {
                            phoneNumber: user.attributes.phoneNumber,
                            otpcode: null
                        }
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error('Error verifying phone number:', error);
            throw new Error('Failed to verify phone number: ' + error.message);
        }
    }




    private async getUserById(userId: string): Promise<any> {
        const token = await this.getAdminToken();
        try {
            const response = await  this.axios.get(
                `https://16.171.20.170:8082/admin/realms/SmartParking/users/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { briefRepresentation: false }
                }
            );
            console.log('User data:', response.data);
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching user by ID:', error);
            throw new Error('Failed to fetch user: ' + error.message);
        }
    }





    async resetPassword(userId: string, password: string): Promise<void> {
      const token = await this.getAdminToken();
      try {
        await  this.axios.put(
          `https://16.171.20.170:8082/admin/realms/SmartParking/users/${userId}`,
          {
            credentials: [
              {
                type: 'password',
                value: password,
                temporary: false
              }
            ]
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        this.logger.log(`Password reset successfully for user ID: ${userId}`);
      } catch (error) {
        this.logger.error('Error resetting password:', error.response?.data || error.message);
        throw new Error('Failed to reset password: ' + (error.response?.data?.error_description || error.message));
      }
    }
}
