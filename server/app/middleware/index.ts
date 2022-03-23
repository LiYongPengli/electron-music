import { Application, Context } from "egg"
import { Users } from "../libs/interface";

export = (options, app: Application) => {
    options
    return async function (ctx: Context, next) {
        let token = ctx.headers.token ? ctx.headers.token : '';
        if(!token) ctx.throw(401,'no login');
        let user:Users = await app.model.User.findOne({token:token});
        if(!user) ctx.throw(401, 'no login');
        let decode;
        try {
            decode = await app.jwt.verify(<string>token, app.config.jwt.secret);
        } catch (err) {
            await app.model.User.updateOne({token:token},{
                $unset:{
                    token:true
                }
            })
            ctx.throw(401, 'Identity is overdue');
        }
        ctx.request.headers.username = decode.username;
        ctx.request.headers.userid = decode.userid;
        await next();
    }
}