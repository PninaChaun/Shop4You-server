import { Body, Controller, Post, Delete, Get, Res, Param, UseGuards, Request, Put } from '@nestjs/common';
import { LoginService } from './login.service';
import { Response } from 'express';
import { UserDTO } from 'src/DTO/user.dto';
import { AutenticationService } from 'src/autentication/autentication.service';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Controller('login')
export class LoginController {
    constructor(private srv: LoginService, private db: DataBaseConnectionService) { }

    @Post() //Login or sign up
    login_user(@Body() user: UserDTO, @Res() res: Response) {
        this.srv.login(user)
            .then(result => {
                res.status(result.stat).json(result.desc);
            })

    }

    @UseGuards(AutenticationService)
    @Get() //Get user info
    async getById(@Request() req, @Res() res: Response) {
        let id = req['user'].id
        let user = await this.srv.getUserById(id)
        res.send(user);
    }

    @UseGuards(AutenticationService)
    @Put() //Update user info
    async updateUser(@Request() req, @Body() user: UserDTO, @Res() res: Response) {
        let id = req['user'].id


        if (id != user.id)
            res.status(401).send()

        else {
            let status = await this.srv.updateUser(user);
            res.status(status).send();
        }
    }

    @Put(':email') //Forgot password, send email with code
    async forgotPassword(@Request() req, @Param('email') email: string, @Res() res: Response) {
        console.log(email);

        let status = await this.srv.forgotPassword(email)

        res.status(status).send()
    }

    @Post(':email/:code') //Forgot password, confirm code
    async ifCodeTrue(@Request() req,@Param('email') email: string, @Param('code') code: string,@Res() res: Response) {         
        let response = this.srv.ifCodeTrue(email, code);
        res.send(response)
    }

    @Put(':email/:newPassword') //Forgot password set new password
    async NewPassword(@Request() req, @Param('email') email: string , @Param('newPassword') newPassword: string, @Res() res: Response) {

        let token = await this.srv.newPassword(email, newPassword)

        res.send(token)
    }    


}
