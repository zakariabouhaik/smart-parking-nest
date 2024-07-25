import { Module } from "@nestjs/common";
import { Model, Mongoose } from "mongoose";
import { UserController } from "./user.controller";
import { UserServices } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserShema } from "./user.model";
import { KeycloaskService } from "src/keycloakService";

@Module({
imports:[MongooseModule.forFeature([{name:'USER',schema:UserShema}])],    
controllers:[UserController],
providers:[UserServices,KeycloaskService]
})


export class UserModule{}