import UserManager from "../../db/UserManager";
import {MiddlewareFunction} from "../../types";
const ensureUser: MiddlewareFunction = async (ctx, next) => {
    const userId = ctx.from?.id;
    if (userId) {
        UserManager.addUserIfNotExists(userId);
    }
    await next();
};
export default ensureUser;