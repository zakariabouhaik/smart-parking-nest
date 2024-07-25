import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ParkingModule } from './Parking/parking.module';
import { UserModule } from './USER/user.module';

@Module({
  imports: [ParkingModule,UserModule,MongooseModule.forRoot('mongodb+srv://contactbouhaikzakaria:fx3ic1leFpP9sKZD@smartparking.rq19lm6.mongodb.net/?retryWrites=true&w=majority&appName=SmartParking')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
