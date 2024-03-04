import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LoginController } from './login.controller';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Module({
    imports: [
        
        JwtModule.register({
          global: true,
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '5H' },
        }),
      ],
      providers: [DataBaseConnectionService,LoginService],
      controllers: [LoginController],
      exports: [LoginService],
    })
export class LoginModule {

}
