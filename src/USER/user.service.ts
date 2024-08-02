import { Inject, Injectable,Logger  } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { USER } from "./user.model";
import { KeycloaskService } from "src/keycloakService";
import { error } from "console";
import { throwError } from "rxjs";

@Injectable()
export class UserServices{

    private readonly logger = new Logger(UserServices.name);


    constructor(@InjectModel('USER')private readonly UserModel:Model<USER>,
    private readonly keycloakService: KeycloaskService
){}


async resendMessage(
    phonenumber:string
):Promise<USER>{
    try{
        const otp = this.keycloakService.generateOTP();
        console.log(phonenumber)
        const user = await this.UserModel.findOne({ phonenumber: phonenumber });
        user.otpcode=otp
        await user.save()
        this.keycloakService.sendSmsOtp(phonenumber,otp)
        return user

    }catch(error){
        console.log(error)
    }
}

async CreateUserMongo(
  
    phonenumber:string,
):Promise<any>{
    
    let userphone = await this.UserModel.findOne({ phonenumber: phonenumber })

        try{
            if(userphone && !userphone.keycloakId){
            
                const otpcode=  this.keycloakService.generateOTP();
                userphone.otpcode=otpcode;
                await this.keycloakService.sendSmsOtp(phonenumber,otpcode)
                await userphone.save();
                return userphone;
            }
       else{ 
        const otpcode=  this.keycloakService.generateOTP();
        await this.keycloakService.sendSmsOtp(phonenumber,otpcode)
        const NewUser = new this.UserModel({phonenumber,otpcode});
        await NewUser.save();
        console.log('Saved user:', NewUser.id);
        return NewUser;
    }
        }
        catch(error){
        console.log(error.message)
        }
}

async updateProfile(userId: string, firstName: string, lastName: string, email: string)
: Promise<USER> {
    try{
        const user = await this.UserModel.findById(userId);
        if(!user){
            throw new Error('User not found');
        }
        user.name=firstName;
        user.lastname=lastName;

        await this.keycloakService.updateUserEmail(user.keycloakId, email);

        await user.save();
        return user;
    }catch(error){
        console.error('Error updating profile:', error);
    throw error;
    }
}

async getuser(userId:string):Promise<any>{
    try{
        const user = await this.UserModel.findById(userId);
        const email = await this.keycloakService.getUserEmailById(user.keycloakId);
        return{
            user,
            email
        }
    }catch(error){
        console.log(error)
    }
}

async CreateUserKey(
    email:string,
    password:string,
    id:string
):Promise<USER>{
     
        try{

        console.log('User Id '+ id);
        console.log('EMail '+ email);
        console.log('Passwor '+ password);
        const keycloakId = await this.keycloakService.createUser(email,password)
        console.log('Received Keycloak ID:', keycloakId);
        
        const NewUser = await this.UserModel.findById(id);
         NewUser.keycloakId=keycloakId;
        console.log('Saved user:', NewUser);
        return await NewUser.save();
        }
        catch(error){
        console.log(error.message)
        }
}



async verifyOtp(userId: string, enteredOtp: string): Promise<boolean> {
    try {
        const user = await this.UserModel.findById(userId);
        console.log('User data for verification:', user);

        if (!user || !user.otpcode) {
            this.logger.error('User or OTP not found');
            return false;
        }

        if (user.otpcode !== enteredOtp) {
            this.logger.error('Invalid OTP');
            return false;
        }

        this.logger.log(`OTP verified successfully for user ${userId}`);
        return true;
    } catch (error) {
        this.logger.error('Error verifying OTP:', error);
        throw new Error('Failed to verify OTP: ' + error.message);
    }
}





async resetPassword(userId: string, password: string): Promise<void> {
    try {
      await this.keycloakService.resetPassword(userId, password);
    } catch (error) {
      console.error('Error in UserService resetPassword:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
  }


   async addUser(
        name:string,
        lastname:string,
        email:string,
        password:string,
        phonenumber:string,
        otpcode:string
    ):Promise<USER>{
         
            try{
            const keycloakId = await this.keycloakService.createUser(email,password)
            console.log('Received Keycloak ID:', keycloakId);
            await this.keycloakService.sendSmsOtp(phonenumber,otpcode)
            const NewUser = new this.UserModel({keycloakId,name,lastname,phonenumber,otpcode});
            console.log('Saved user:', NewUser);
            return await NewUser.save();
            }
            catch(error){
            console.log(error.message)
            }
    }




    async login (email:string,password:string):Promise<{access_token: string; refresh_token: string ,userId: string }>{
        try{
            
            const keycloakResponse = await this.keycloakService.login(email,password);
            const user = await this.UserModel.findOne({ phonenumber: email });
           
            return {
                access_token: keycloakResponse.access_token,
                refresh_token: keycloakResponse.refresh_token,
                userId: user._id.toString()
              };
          

        }catch(error){
            throw new Error('Login Faieled: '+ error.message)
        }
    }

    async logout(refreshToken:string):Promise<void>{
        try{
            await this.keycloakService.logout(refreshToken);
        }catch(error){
    throw error;
        }
    }

  



    async verifyotp(email:string,otp:string):Promise<boolean>{
             const userid = await this.keycloakService.getUserIdByEmail(email);
            return await this.keycloakService.verifyPhoneNumber(userid,otp);

    }
}