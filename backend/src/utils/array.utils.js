import { OrderDirection, OrderFields } from "../enums/orderables.enum.js";

export class ArrayUtils {
    static sortObjects(array, orderBy = OrderFields.DATE, orderDir = OrderDirection.ASC) {
        return [...array].sort((a, b) => {
            const valA = a[orderBy];
            const valB = b[orderBy];
            if (valA < valB) return orderDir === OrderDirection.ASC ? -1 : 1;
            if (valA > valB) return orderDir === OrderDirection.ASC ? 1 : -1;
            return 0;
        });
    }
}