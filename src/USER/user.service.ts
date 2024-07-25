import { Inject, Injectable,Logger  } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { USER } from "./user.model";
import { KeycloaskService } from "src/keycloakService";
import { error } from "console";

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
    name:string,
    lastname:string,
    phonenumber:string,
):Promise<any>{
     
        try{
        const otpcode=  this.keycloakService.generateOTP();
        await this.keycloakService.sendSmsOtp(phonenumber,otpcode)
        const NewUser = new this.UserModel({name,lastname,phonenumber,otpcode});
        await NewUser.save();
        console.log('Saved user:', NewUser.id);
        return NewUser;
        }
        catch(error){
        console.log(error.message)
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




    async login (email:string,password:string):Promise<{access_token: string; refresh_token: string }>{
        try{
            return await this.keycloakService.login(email,password);
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