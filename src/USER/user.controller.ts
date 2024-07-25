import { Controller, Post ,Body, HttpException, HttpStatus,Logger, Put } from "@nestjs/common";
import { UserServices } from "./user.service";
import { USER } from "./user.model";
import { KeycloaskService } from "src/keycloakService";

@Controller('User')
export class UserController{
    private readonly logger = new Logger(UserController.name);
    constructor(private readonly UserService:UserServices,
        private readonly Kaycloak:KeycloaskService
    ){

    }
   
   
    @Post('registemongo')
    async CreateUserMongo(
         @Body() User:{
            name:string,
            lastname:string,
            phonenumber:string,
         }
     ):Promise<string>{
        return await this.UserService.CreateUserMongo(
             User.name,
             User.lastname,
             User.phonenumber,
         );
          
     }

     @Post('registekeyclok')
     async CreateUserekeyclok(
          @Body() User:{
            email:string,
            password:string,
           id:string
          }
      ):Promise<string>{
      
         const NewUser= await this.UserService.CreateUserKey(
              User.email,
              User.password,
              User.id
          );
          return NewUser.id;
      }
  
      @Post('resendsms')
      async Resendsms(
        @Body()Sms:{
            phonenumber:string
        }){
          try{ return this.UserService.resendMessage(Sms.phonenumber)
          }catch(error){
            console.log(error.message)
          }
        }
      
   
    @Post('verify-otp')
        async verifyOtp(@Body() body: { userId: string, otp: string }) {
        const isValid = await this.UserService.verifyOtp(body.userId, body.otp);
            if (isValid) {
                return true;
            } else {
                return false;
            }
        }
   
   
        @Put('forgetpassword')
        async resetPassword(@Body() body: { userId: string, password: string }) {
          try {
            await this.UserService.resetPassword(body.userId, body.password);
            return true;
          } catch (error) {
            console.error('Error in resetPassword controller:', error);
            throw new HttpException('Failed to reset password', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
   
   
   
    @Post('register')
   async addParking(
        @Body() User:{
            name:string,
            lastname:string,
            email:string,
            password:string;
            phonenumber:string;
            
        }
    ):Promise<USER>{
        const otp = this.generateOTP();
       const NewUser= await this.UserService.addUser(User.name,
            User.lastname,
            User.email,
            User.password,
            User.phonenumber,
            otp
        )
        return NewUser;
    }


    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    @Post('login')
    async login(@Body()loginData:{email:string,password:string}){
        try{
            const result= await this.UserService.login(loginData.email,loginData.password);
            this.logger.debug('Login result:', result);
            return {
                message: 'Login successful',
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            };
        }catch(error){
            throw new HttpException('Login failed'+error.message,HttpStatus.UNAUTHORIZED)
        }
    }

    @Put('verifynumber')
    async verifynumber(@Body() data:{email:string,otp:string}):Promise<boolean>{
        try{
            console.log('ha li wssalni : '+data.otp)
            return await this.UserService.verifyotp(data.email,data.otp)
        }catch(error){
            throw new HttpException('Verification failed: ' + error.message, HttpStatus.BAD_REQUEST);

        }
    }

    @Post('logout')
    async logout(@Body() logoutData: { refreshToken: string }) {
        try {
          await this.UserService.logout(logoutData.refreshToken);
          return { message: 'Logout successful' };
        } catch (error) {
            this.logger.error('Logout error in UserController:', error.message);

          throw new HttpException(
            'Logout failed: ' + error.message,
            HttpStatus.BAD_REQUEST
          );
        }
    }




}