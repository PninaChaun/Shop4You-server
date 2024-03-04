import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { DataBaseConnectionService } from './data-base-connection/data-base-connection.service';
import { JwtService } from '@nestjs/jwt';
import { LoginModule } from './login/login.module';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { AutenticationService } from './autentication/autentication.service';
import { ShopperService } from './shopper/shopper.service';
import { ShopperController } from './shopper/shopper.controller';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { EmailService } from './email/email.service';
import { InvitesController } from './invites/invites.controller';
import { InvitesService } from './invites/invites.service';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    // LoginModule,
    MailerModule.forRoot({//ghpjvsxlpffcbaar pnina
      transport: 'smtps://shop.for.community@gmail.com:lskkdgcgetmqzppz@smtp.gmail.com',
      defaults: {///lskk dgcg etmq zppz shop
        from: '"shop4you" <shop.for.community@gmail.com>',
      },
    }),],
  controllers: [AppController, LoginController, OrdersController, ShopperController,GroupsController, InvitesController, ChatController],
  providers: [AppService, LoginService, DataBaseConnectionService, JwtService, OrdersService, AutenticationService, ShopperService,  GroupsService, EmailService, InvitesService, ChatService],
})
export class AppModule {}
