/**
 * The `clientId`s of orders taken on this phone since the app started. The live stream sends them back like anyone
 * else's; this phone does not chime for them, since the person holding it just took them.
 */
const ownOrders = new Set<string>();

export default ownOrders;
