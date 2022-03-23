import { Controller } from 'egg';

export default class ViewController extends Controller{
    public async register(){
        const { ctx } = this;
        await ctx.render('register.ejs');
    }
    public async admin(){
        const { ctx } = this;
        await ctx.render('admin.ejs');
    }
}